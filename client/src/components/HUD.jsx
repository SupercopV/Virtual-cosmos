export function HUD({ users, connections, myUsername, connected }) {
  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20"
        style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.95), transparent)" }}>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🌌</span>
          <span className="font-bold text-sm" style={{ fontFamily: "Syne", color: "#e2e8f0" }}>
            Virtual Cosmos
          </span>
        </div>

        {/* Center stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: connected ? "#22c55e" : "#ef4444" }} />
            <span className="text-xs" style={{ color: "var(--cosmos-muted)" }}>
              {users.length} online
            </span>
          </div>

          {connections.size > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-fade-in"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />
              <span className="text-xs" style={{ color: "#a78bfa" }}>
                {connections.size} connected
              </span>
            </div>
          )}
        </div>

        {/* User badge */}
        <div className="text-xs px-3 py-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--cosmos-muted)",
            fontFamily: "Syne",
          }}>
          {myUsername}
        </div>
      </div>

      {/* Controls hint - bottom left */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="px-3 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(10,10,15,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--cosmos-muted)",
            backdropFilter: "blur(10px)",
          }}>
          <span className="font-medium" style={{ color: "var(--cosmos-text)" }}>Move: </span>
          WASD / ↑↓←→ · Click to teleport
        </div>
      </div>

      {/* Proximity notice */}
      {connections.size === 0 && users.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <div className="px-4 py-2 rounded-xl text-xs text-center"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#c4b5fd",
              backdropFilter: "blur(10px)",
            }}>
            🔵 Move close to another user to start chatting
          </div>
        </div>
      )}
    </>
  );
}
