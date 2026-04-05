# 🌌 Virtual Cosmos

> A 2D real-time virtual environment where users can move around and interact with each other through **proximity-based chat** — when you get close, chat connects; when you move away, it disconnects.



---

## ✨ Features

| Feature | Details |
|---|---|
| 🕹️ **User Movement** | WASD / Arrow keys + click-to-teleport |
| 🌐 **Real-Time Multiplayer** | Live position sync via Socket.IO |
| 📡 **Proximity Detection** | 120px radius — auto connect/disconnect |
| 💬 **Proximity Chat** | Chat panel appears/disappears on proximity |
| 👥 **Multi-peer Chat** | Tabbed UI when connected to multiple users |
| 🎨 **Avatar Customization** | Username + 8 avatar colors on join |
| 🗄️ **MongoDB Sessions** | Persists user sessions (optional) |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** — fast dev server, modern bundler
- **PixiJS v7** — WebGL-accelerated 2D canvas rendering
- **Tailwind CSS** — utility-first styling
- **Socket.IO Client** — real-time bidirectional events

### Backend
- **Node.js** + **Express** — HTTP server
- **Socket.IO** — WebSocket real-time communication
- **MongoDB** + **Mongoose** — user session persistence *(optional)*

### Why this stack?
- **PixiJS** over plain Canvas API: hardware-accelerated rendering handles many simultaneous avatars smoothly with built-in sprite/graphics APIs
- **Socket.IO** over raw WebSockets: automatic reconnection, fallback transports, room abstractions
- **MongoDB** is schema-flexible for evolving user session data, and the app degrades gracefully without it (in-memory mode)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/SupercopV/Virtual-cosmos.git
cd virtual-cosmos

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup

```bash
# Server — copy and edit
cd server
cp .env.example .env

# Client — copy and edit
cd ../client
cp .env.example .env
```

**Server `.env`:**
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/virtual-cosmos   # optional
CLIENT_URL=http://localhost:5173
```

**Client `.env`:**
```env
VITE_SERVER_URL=http://localhost:3001
```

### Running Locally

Open **two terminal windows**:

```bash
# Terminal 1 — Backend
cd server
npm run dev        # uses nodemon for hot-reload
# ✅ Server running on http://localhost:3001

# Terminal 2 — Frontend
cd client
npm run dev
# ✅ Client running on http://localhost:5173
```

Open `http://localhost:5173` in **two or more browser tabs** to simulate multiple users.

---

## 🎮 How to Use

1. **Enter your name** and pick an avatar color on the join screen
2. You appear as a colored circle on the 2D canvas
3. **Move** with `W A S D` or `↑ ↓ ← →` keys, or **click** anywhere to teleport
4. When you get **close to another user** (within 120px):
   - A glowing ring appears around both avatars
   - The **Chat panel** slides in on the right
5. Send messages — they're only visible to users in your proximity
6. **Move away** and the chat panel disappears — connection terminated

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│              CLIENT (React)             │
│                                         │
│  JoinScreen → App → CosmosCanvas (Pixi)│
│               ↕         ↕              │
│           useSocket   usePixi           │
│               ↕                        │
│           ChatPanel ← proximity events  │
└────────────────┬────────────────────────┘
                 │ Socket.IO (WebSocket)
┌────────────────▼────────────────────────┐
│              SERVER (Node.js)           │
│                                         │
│  user:join  → register user in Map      │
│  user:move  → update pos + checkProximity│
│  chat:message → validate proximity      │
│                 → relay to peer         │
│  disconnect → notify all connections    │
└────────────────┬────────────────────────┘
                 │ Mongoose
┌────────────────▼────────────────────────┐
│           MongoDB (optional)            │
│   UserSession { userId, username,       │
│   avatarColor, position, lastSeen }     │
└─────────────────────────────────────────┘
```

### Proximity Algorithm

```js
// Server-side, runs on every user:move event
function checkProximity(movedSocketId) {
  users.forEach((otherUser, otherSocketId) => {
    const dist = Math.sqrt(
      (a.x - b.x) ** 2 + (a.y - b.y) ** 2
    );
    if (dist < PROXIMITY_RADIUS && !wasConnected) → emit proximity:connected
    if (dist >= PROXIMITY_RADIUS && wasConnected) → emit proximity:disconnected
  });
}
```

Connections are stored as a `Set<socketId>` per user in memory — O(n) per move event, lightweight for typical room sizes.

---

## 📡 Socket Events Reference

| Event | Direction | Payload | Description |
|---|---|---|---|
| `user:join` | Client → Server | `{ username, avatarColor }` | Enter the cosmos |
| `user:joined` | Server → Client | `{ userId, position }` | Confirmed with spawn position |
| `user:move` | Client → Server | `{ position: {x, y} }` | Position update |
| `users:update` | Server → All | `User[]` | Full user list broadcast |
| `proximity:connected` | Server → Client | `{ socketId, username, avatarColor }` | Peer entered radius |
| `proximity:disconnected` | Server → Client | `{ socketId }` | Peer left radius |
| `chat:message` | Client → Server | `{ toSocketId, message }` | Send a chat message |
| `chat:message` | Server → Client | `{ fromSocketId, fromUsername, message, timestamp }` | Receive a message |

---

## 🗂 Project Structure

```
virtual-cosmos/
├── server/
│   ├── index.js          # Express + Socket.IO server, proximity logic
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Root component, layout
        ├── socket.js         # Socket.IO singleton
        ├── index.css         # Global styles + animations
        ├── hooks/
        │   ├── useSocket.js  # All socket events & shared state
        │   └── usePixi.js    # PixiJS canvas, game loop, sprites
        └── components/
            ├── JoinScreen.jsx    # Name + color picker
            ├── CosmosCanvas.jsx  # Canvas wrapper
            ├── ChatPanel.jsx     # Proximity chat UI
            └── HUD.jsx           # Top bar, stats, hints
```

---

## 🔮 Bonus Features Implemented

- **Click-to-teleport** — click anywhere on the canvas to instantly move there
- **Smooth interpolation** — other users' avatars lerp to their new positions (no jitter)
- **Multi-peer chat tabs** — if connected to 3 users simultaneously, each gets a tab
- **MongoDB session persistence** — users' data saved even if server restarts
- **Graceful degradation** — works fully without MongoDB (in-memory fallback)
- **Connection ring glow** — avatars get a purple ring when in proximity
- **Proximity aura** — your 120px detection radius is visualized as a subtle circle

---

## 📝 License

MIT — built for the Tutedude MERN Intern Assignment.
