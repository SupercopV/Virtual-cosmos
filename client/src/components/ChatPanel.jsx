import { useState, useRef, useEffect } from "react";

export function ChatPanel({ connections, messages, mySocketId, onSendMessage, onClose }) {
  const [input, setInput] = useState("");
  const [activePeer, setActivePeer] = useState(null);
  const bottomRef = useRef(null);
  const connectionList = [...connections.entries()]; // [[socketId, {username, avatarColor}]]

  // Auto-select first peer
  useEffect(() => {
    if (connectionList.length > 0 && !activePeer) {
      setActivePeer(connectionList[0][0]);
    }
    if (connectionList.length === 0) {
      setActivePeer(null);
    }
    if (activePeer && !connections.has(activePeer)) {
      setActivePeer(connectionList[0]?.[0] || null);
    }
  }, [connections]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredMessages = activePeer
    ? messages.filter(
        (m) =>
          (m.fromSocketId === activePeer || m.fromSocketId === mySocketId) &&
          (m.fromSocketId === activePeer || m.fromSocketId === mySocketId)
      )
    : [];

  const send = () => {
    if (!input.trim() || !activePeer) return;
    onSendMessage(activePeer, input.trim());
    setInput("");
  };

  if (connectionList.length === 0) {
    return (
      <div className="animate-slide-in flex flex-col items-center justify-center h-full gap-3"
        style={{ color: "var(--cosmos-muted)" }}>
        <div className="text-3xl opacity-40">📡</div>
        <p className="text-sm text-center">
          Move close to another<br />user to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-in flex flex-col h-full">
      {/* Peer tabs */}
      {connectionList.length > 1 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {connectionList.map(([sid, peer]) => (
            <button
              key={sid}
              onClick={() => setActivePeer(sid)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activePeer === sid
                  ? peer.avatarColor + "33"
                  : "rgba(255,255,255,0.05)",
                border: activePeer === sid
                  ? `1px solid ${peer.avatarColor}66`
                  : "1px solid rgba(255,255,255,0.06)",
                color: activePeer === sid ? "white" : "var(--cosmos-muted)",
              }}>
              <span className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: peer.avatarColor }} />
              {peer.username}
            </button>
          ))}
        </div>
      )}

      {/* Active peer header */}
      {activePeer && connections.has(activePeer) && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: connections.get(activePeer)?.avatarColor }}>
            {connections.get(activePeer)?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--cosmos-text)" }}>
              {connections.get(activePeer)?.username}
            </p>
            <p className="text-[10px]" style={{ color: "#22c55e" }}>● In proximity</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
        {filteredMessages.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: "var(--cosmos-muted)" }}>
            No messages yet. Say hi! 👋
          </p>
        )}
        {filteredMessages.map((msg, i) => {
          const isMe = msg.fromSocketId === mySocketId;
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                {!isMe && (
                  <p className="text-[10px] mb-1 ml-1" style={{ color: "var(--cosmos-muted)" }}>
                    {msg.fromUsername}
                  </p>
                )}
                <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed"
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                      : "rgba(255,255,255,0.07)",
                    color: "var(--cosmos-text)",
                    borderBottomRightRadius: isMe ? "4px" : "16px",
                    borderBottomLeftRadius: isMe ? "16px" : "4px",
                  }}>
                  {msg.message}
                </div>
                <p className={`text-[9px] mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}
                  style={{ color: "var(--cosmos-muted)" }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--cosmos-text)",
            fontFamily: "DM Sans",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || !activePeer}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
