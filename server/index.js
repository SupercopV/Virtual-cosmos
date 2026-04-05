import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/virtual-cosmos";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.warn("⚠️  MongoDB not connected (running in-memory):", err.message));

// ─── Mongoose Schema ──────────────────────────────────────────────────────────
const userSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  avatarColor: String,
  position: { x: Number, y: Number },
  lastSeen: { type: Date, default: Date.now },
});

const UserSession = mongoose.model("UserSession", userSessionSchema);

// ─── In-Memory State ──────────────────────────────────────────────────────────
// Maps socketId → { userId, username, avatarColor, position, connections }
const users = new Map();

const PROXIMITY_RADIUS = 120; // pixels

function getDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildPublicUser(socketId) {
  const u = users.get(socketId);
  if (!u) return null;
  return {
    socketId,
    userId: u.userId,
    username: u.username,
    avatarColor: u.avatarColor,
    position: u.position,
  };
}

function broadcastUserList() {
  const list = [];
  users.forEach((_, sid) => {
    const pub = buildPublicUser(sid);
    if (pub) list.push(pub);
  });
  io.emit("users:update", list);
}

function checkProximity(movedSocketId) {
  const movedUser = users.get(movedSocketId);
  if (!movedUser) return;

  users.forEach((otherUser, otherSocketId) => {
    if (otherSocketId === movedSocketId) return;

    const dist = getDistance(movedUser.position, otherUser.position);
    const wasConnected = movedUser.connections.has(otherSocketId);
    const isClose = dist < PROXIMITY_RADIUS;

    if (isClose && !wasConnected) {
      // Connect the two users
      movedUser.connections.add(otherSocketId);
      otherUser.connections.add(movedSocketId);

      // Notify both
      io.to(movedSocketId).emit("proximity:connected", {
        socketId: otherSocketId,
        username: otherUser.username,
        avatarColor: otherUser.avatarColor,
      });
      io.to(otherSocketId).emit("proximity:connected", {
        socketId: movedSocketId,
        username: movedUser.username,
        avatarColor: movedUser.avatarColor,
      });

      console.log(`🔗 ${movedUser.username} ↔ ${otherUser.username} connected`);
    } else if (!isClose && wasConnected) {
      // Disconnect the two users
      movedUser.connections.delete(otherSocketId);
      otherUser.connections.delete(movedSocketId);

      io.to(movedSocketId).emit("proximity:disconnected", {
        socketId: otherSocketId,
      });
      io.to(otherSocketId).emit("proximity:disconnected", {
        socketId: movedSocketId,
      });

      console.log(`💔 ${movedUser.username} ↔ ${otherUser.username} disconnected`);
    }
  });
}

// ─── Socket.IO Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🌐 Socket connected: ${socket.id}`);

  // ── Join cosmos ──
  socket.on("user:join", async ({ username, avatarColor }) => {
    const userId = `user_${socket.id.slice(0, 8)}`;
    const position = {
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 450) + 50,
    };

    users.set(socket.id, {
      userId,
      username: username || `Guest_${Math.floor(Math.random() * 1000)}`,
      avatarColor: avatarColor || "#6366f1",
      position,
      connections: new Set(),
    });

    // Persist to MongoDB (best-effort)
    try {
      await UserSession.findOneAndUpdate(
        { userId },
        { userId, username, avatarColor, position, lastSeen: new Date() },
        { upsert: true, new: true }
      );
    } catch (_) {}

    socket.emit("user:joined", { userId, position });
    broadcastUserList();
    console.log(`👤 ${username} joined the cosmos`);
  });

  // ── Move ──
  socket.on("user:move", ({ position }) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.position = position;
    checkProximity(socket.id);
    broadcastUserList();
  });

  // ── Chat message ──
  socket.on("chat:message", ({ toSocketId, message }) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    // Only allow message if within proximity
    if (!sender.connections.has(toSocketId)) return;

    const payload = {
      fromSocketId: socket.id,
      fromUsername: sender.username,
      avatarColor: sender.avatarColor,
      message,
      timestamp: Date.now(),
    };

    // Send to both sender and recipient
    socket.emit("chat:message", payload);
    io.to(toSocketId).emit("chat:message", payload);
  });

  // ── Disconnect ──
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      // Notify all connected users
      user.connections.forEach((connSocketId) => {
        const connUser = users.get(connSocketId);
        if (connUser) connUser.connections.delete(socket.id);
        io.to(connSocketId).emit("proximity:disconnected", {
          socketId: socket.id,
        });
      });
      console.log(`👋 ${user.username} left the cosmos`);
      users.delete(socket.id);
    }
    broadcastUserList();
  });
});

// ─── REST: active users count ─────────────────────────────────────────────────
app.get("/api/status", (_, res) => {
  res.json({ activeUsers: users.size, status: "online" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
