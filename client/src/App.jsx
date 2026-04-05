import { useState } from "react";
import { JoinScreen } from "./components/JoinScreen";
import { CosmosCanvas } from "./components/CosmosCanvas";
import { ChatPanel } from "./components/ChatPanel";
import { HUD } from "./components/HUD";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  const [hasJoined, setHasJoined] = useState(false);
  const [myUsername, setMyUsername] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  const {
    mySocketId,
    users,
    connections,
    messages,
    connected,
    join,
    move,
    sendMessage,
  } = useSocket();

  const handleJoin = (username, avatarColor) => {
    setMyUsername(username);
    join(username, avatarColor);
    setHasJoined(true);
  };

  if (!hasJoined) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  // Still waiting for socket handshake
  if (!mySocketId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: "var(--cosmos-bg)" }}>
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">🌌</div>
          <p className="text-sm" style={{ color: "var(--cosmos-muted)", fontFamily: "Syne" }}>
            Entering cosmos…
          </p>
        </div>
      </div>
    );
  }

  const showChat = connections.size > 0;

  return (
    <div className="relative w-full h-screen overflow-hidden"
      style={{ background: "var(--cosmos-bg)" }}>

      {/* Pixi canvas */}
      <CosmosCanvas
        mySocketId={mySocketId}
        users={users}
        connections={connections}
        onMove={move}
      />

      {/* HUD overlay */}
      <HUD
        users={users}
        connections={connections}
        myUsername={myUsername}
        connected={connected}
      />

      {/* Chat sidebar */}
      {showChat && (
        <div className="absolute right-4 top-16 bottom-16 w-72 z-30 animate-slide-in flex flex-col"
          style={{
            background: "rgba(12,12,20,0.92)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 40px rgba(124,58,237,0.12), 0 20px 40px rgba(0,0,0,0.4)",
          }}>

          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
              <span className="text-sm font-semibold" style={{ fontFamily: "Syne", color: "var(--cosmos-text)" }}>
                Proximity Chat
              </span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
              {connections.size}
            </span>
          </div>

          {/* Chat content */}
          <div className="flex-1 overflow-hidden p-4">
            <ChatPanel
              connections={connections}
              messages={messages}
              mySocketId={mySocketId}
              onSendMessage={sendMessage}
            />
          </div>
        </div>
      )}

      {/* "Move closer" hint when alone */}
      {!showChat && users.length <= 1 && (
        <div className="absolute right-4 top-16 z-30 animate-fade-in">
          <div className="w-72 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(12,12,20,0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
            }}>
            <p className="text-xs text-center" style={{ color: "var(--cosmos-muted)" }}>
              Waiting for other users to join...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
