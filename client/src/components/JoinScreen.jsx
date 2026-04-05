import { useState } from "react";

const AVATAR_COLORS = [
  "#7c3aed", "#db2777", "#0891b2", "#059669",
  "#d97706", "#dc2626", "#4f46e5", "#0d9488",
];

export function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    onJoin(username.trim(), color);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "var(--cosmos-bg)" }}>
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #db2777, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative animate-fade-in w-full max-w-md mx-4">
        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(18,18,26,0.95)",
            border: "1px solid rgba(124,58,237,0.3)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 60px rgba(124,58,237,0.15), 0 24px 48px rgba(0,0,0,0.4)",
          }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <span className="text-2xl">🌌</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-1"
              style={{ fontFamily: "Syne", color: "#e2e8f0" }}>
              Virtual Cosmos
            </h1>
            <p className="text-sm" style={{ color: "var(--cosmos-muted)" }}>
              Move close to others · Chat connects · Move away · Chat disconnects
            </p>
          </div>

          {/* Username */}
          <div className="mb-5">
            <label className="block text-xs font-medium mb-2 uppercase tracking-widest"
              style={{ color: "var(--cosmos-muted)" }}>
              Your Name
            </label>
            <input
              type="text"
              maxLength={20}
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="e.g. Vamshi"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: error ? "1px solid #dc2626" : "1px solid rgba(255,255,255,0.08)",
                color: "var(--cosmos-text)",
                fontFamily: "DM Sans",
              }}
            />
            {error && <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>{error}</p>}
          </div>

          {/* Avatar color */}
          <div className="mb-8">
            <label className="block text-xs font-medium mb-3 uppercase tracking-widest"
              style={{ color: "var(--cosmos-muted)" }}>
              Avatar Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-9 h-9 rounded-xl transition-all"
                  style={{
                    background: c,
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                    outline: color === c ? `3px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: color, fontFamily: "Syne" }}>
              {username?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--cosmos-text)" }}>
                {username || "Your name"}
              </p>
              <p className="text-xs" style={{ color: "var(--cosmos-muted)" }}>Ready to enter the cosmos</p>
            </div>
          </div>

          {/* Enter button */}
          <button
            onClick={handleJoin}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white",
              fontFamily: "Syne",
              boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
            }}>
            Enter Cosmos →
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--cosmos-muted)" }}>
          Use WASD / Arrow keys to move · Click anywhere to teleport
        </p>
      </div>
    </div>
  );
}
