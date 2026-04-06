# 🌌 Virtual Cosmos

> A 2D real-time virtual environment where users move around and interact through **proximity-based chat** — get close and chat connects, move away and it disconnects.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🕹️ **User Movement** | WASD / Arrow keys + click-to-teleport |
| 🌐 **Real-Time Multiplayer** | Live position sync via Socket.IO |
| 📡 **Proximity Detection** | 120px radius — auto connect/disconnect |
| 💬 **Proximity Chat** | Chat panel appears/disappears automatically |
| 👥 **Multi-peer Chat** | Tabbed UI when connected to multiple users |
| 🎨 **Avatar Customization** | Username + 8 avatar colors on join |
| 🗄️ **MongoDB Sessions** | Persists user sessions (optional, in-memory fallback) |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** — fast dev server, modern bundler
- **HTML5 Canvas API** — lightweight 2D rendering via `requestAnimationFrame`
- **Tailwind CSS** — utility-first styling
- **Socket.IO Client** — real-time bidirectional events

### Backend
- **Node.js** + **Express** — HTTP server
- **Socket.IO** — WebSocket real-time communication
- **MongoDB** + **Mongoose** — user session persistence *(optional)*

### Why this stack?
- **HTML5 Canvas** over WebGL libraries: zero dependencies, runs natively in every browser, `requestAnimationFrame` loop gives full control over rendering at 60fps
- **Socket.IO** over raw WebSockets: automatic reconnection, fallback transports, and clean event abstractions
- **MongoDB** is schema-flexible for evolving session data; the app degrades gracefully without it using an in-memory Map

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB *(optional — app works without it)*

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/virtual-cosmos.git
cd virtual-cosmos

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup

```bash
# Server
cd server
cp .env.example .env

# Client
cd ../client
cp .env.example .env
```

**Server `.env`:**
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/virtual-cosmos
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
npm run dev
# ✅ Server running on http://localhost:3001

# Terminal 2 — Frontend
cd client
npm run dev
# ✅ Client running on http://localhost:5173
```

Open `http://localhost:5173` in **two or more browser tabs** to test multiplayer.

---

## 🎮 How to Use

1. Enter your **name** and pick an **avatar color** on the join screen
2. You appear as a colored circle on the 2D canvas
3. **Move** with `W A S D` or `↑ ↓ ← →`, or **click anywhere** to teleport
4. When you get **close to another user** (within 120px radius):
   - A pulsing glow ring appears around their avatar
   - The **Chat panel** slides in on the right
5. Send messages — only visible to users currently in your proximity
6. **Move away** and the chat panel disappears — connection terminated automatically

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────┐
│               CLIENT (React)                 │
│                                              │
│  JoinScreen → App → CosmosCanvas            │
│               ↕       (HTML5 Canvas loop)    │
│           useSocket                          │
│               ↕                             │
│           ChatPanel ← proximity events       │
└─────────────────┬────────────────────────────┘
                  │ Socket.IO (WebSocket)
┌─────────────────▼────────────────────────────┐
│              SERVER (Node.js)                │
│                                              │
│  user:join    → register user in Map         │
│  user:move    → update pos + checkProximity  │
│  chat:message → validate proximity           │
│                 → relay to peer              │
│  disconnect   → notify all connections       │
└─────────────────┬────────────────────────────┘
                  │ Mongoose (optional)
┌─────────────────▼────────────────────────────┐
│           MongoDB (optional)                 │
│  UserSession { userId, username,             │
│  avatarColor, position, lastSeen }           │
└──────────────────────────────────────────────┘
```

### Proximity Algorithm

```js
// Server-side — runs on every user:move event — O(n) per move
function checkProximity(movedSocketId) {
  users.forEach((otherUser, otherSocketId) => {
    const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    if (dist < PROXIMITY_RADIUS && !wasConnected)
      → emit proximity:connected  (to both users)

    if (dist >= PROXIMITY_RADIUS && wasConnected)
      → emit proximity:disconnected  (to both users)
  });
}
```

Connections are tracked as a `Set<socketId>` per user in memory — lightweight and fast for typical room sizes.

---

## 📡 Socket Events Reference

| Event | Direction | Payload | Description |
|---|---|---|---|
| `user:join` | Client → Server | `{ username, avatarColor }` | Enter the cosmos |
| `user:joined` | Server → Client | `{ userId, position }` | Confirmed with random spawn position |
| `user:move` | Client → Server | `{ position: {x, y} }` | Send position update |
| `users:update` | Server → All | `User[]` | Full user list broadcast |
| `proximity:connected` | Server → Client | `{ socketId, username, avatarColor }` | Peer entered radius |
| `proximity:disconnected` | Server → Client | `{ socketId }` | Peer left radius |
| `chat:message` | Client → Server | `{ toSocketId, message }` | Send a message |
| `chat:message` | Server → Client | `{ fromSocketId, fromUsername, message, timestamp }` | Receive a message |

---

## 🗂 Project Structure

```
virtual-cosmos/
├── server/
│   ├── index.js           # Express + Socket.IO + proximity logic
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx           # React entry point
        ├── App.jsx            # Root layout + state
        ├── socket.js          # Socket.IO singleton
        ├── index.css          # Global styles + animations
        ├── hooks/
        │   └── useSocket.js   # All socket events & shared state
        └── components/
            ├── CosmosCanvas.jsx   # HTML5 Canvas game loop + rendering
            ├── JoinScreen.jsx     # Name + color picker
            ├── ChatPanel.jsx      # Proximity chat UI
            └── HUD.jsx            # Top bar, online count, hints
```

---

## 🔮 Bonus Features

- **Click-to-teleport** — click anywhere on the canvas to instantly move there
- **Pulsing connection rings** — animated glow around avatars when in proximity
- **Proximity aura** — dashed circle shows your 120px detection radius
- **Multi-peer chat tabs** — connected to multiple users? each gets their own tab
- **MongoDB persistence** — user sessions saved across server restarts
- **Graceful in-memory fallback** — works fully even without MongoDB connected
- **Throttled position updates** — emits every 2nd frame to avoid flooding the server

---

## 📝 License

MIT — built for the Tutedude Full Stack Developer Intern Assignment.
