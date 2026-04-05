import { useEffect, useRef } from "react";

const PROXIMITY_RADIUS = 120;
const AVATAR_RADIUS = 22;
const SPEED = 4;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export function CosmosCanvas({ mySocketId, users, connections, onMove }) {
  const canvasRef = useRef(null);
  const keysRef   = useRef({});
  const myPosRef  = useRef({ x: 400, y: 300 });
  const rafRef    = useRef(null);

  // Keep latest props in refs so the animation loop always sees fresh data
  const usersRef   = useRef(users);
  const connsRef   = useRef(connections);
  const myIdRef    = useRef(mySocketId);
  const onMoveRef  = useRef(onMove);
  usersRef.current  = users;
  connsRef.current  = connections;
  myIdRef.current   = mySocketId;
  onMoveRef.current = onMove;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Size canvas to fill window
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Keyboard
    const onKeyDown = (e) => {
      keysRef.current[e.key] = true;
      // prevent page scroll with arrow keys
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))
        e.preventDefault();
    };
    const onKeyUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    // Click to teleport
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      myPosRef.current = pos;
      onMoveRef.current(pos);
    };
    canvas.addEventListener("click", onClick);

    let tick = 0;

    function drawFrame() {
      const W = canvas.width;
      const H = canvas.height;
      const myId = myIdRef.current;
      const allUsers = usersRef.current;
      const conns = connsRef.current;

      // ── Move ──────────────────────────────────────────────────────────
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k["ArrowLeft"]  || k["a"] || k["A"]) dx -= SPEED;
      if (k["ArrowRight"] || k["d"] || k["D"]) dx += SPEED;
      if (k["ArrowUp"]    || k["w"] || k["W"]) dy -= SPEED;
      if (k["ArrowDown"]  || k["s"] || k["S"]) dy += SPEED;

      if (dx !== 0 || dy !== 0) {
        myPosRef.current = {
          x: Math.max(AVATAR_RADIUS, Math.min(W - AVATAR_RADIUS, myPosRef.current.x + dx)),
          y: Math.max(AVATAR_RADIUS, Math.min(H - AVATAR_RADIUS, myPosRef.current.y + dy)),
        };
        if (++tick % 2 === 0) onMoveRef.current({ ...myPosRef.current });
      }

      // ── Clear ─────────────────────────────────────────────────────────
      ctx.fillStyle = "#0d0d14";
      ctx.fillRect(0, 0, W, H);

      // ── Grid ──────────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      // ── Draw each user ────────────────────────────────────────────────
      allUsers.forEach((user) => {
        const isMe = user.socketId === myId;
        const isConnected = conns.has(user.socketId);

        // Use server position for others, local ref for self
        const x = isMe ? myPosRef.current.x : user.position.x;
        const y = isMe ? myPosRef.current.y : user.position.y;
        const color = user.avatarColor || "#7c3aed";
        const rgb = hexToRgb(color);

        // Proximity aura (only for self, or when connected)
        if (isMe) {
          ctx.beginPath();
          ctx.arc(x, y, PROXIMITY_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(124,58,237,0.25)`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Connection pulse ring
        if (isConnected && !isMe) {
          const pulse = (Math.sin(Date.now() / 400) + 1) / 2; // 0→1→0
          ctx.beginPath();
          ctx.arc(x, y, AVATAR_RADIUS + 8 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167,139,250,${0.4 + pulse * 0.4})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Avatar shadow / glow
        ctx.beginPath();
        ctx.arc(x, y, AVATAR_RADIUS + 4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, AVATAR_RADIUS - 4, x, y, AVATAR_RADIUS + 12);
        glow.addColorStop(0, `rgba(${rgb},0.4)`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = glow;
        ctx.fill();

        // Avatar circle
        ctx.beginPath();
        ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = isMe ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = isMe ? 3 : 2;
        ctx.stroke();

        // First letter
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((user.username?.[0] || "?").toUpperCase(), x, y);

        // Name tag
        ctx.font = "11px Arial";
        ctx.fillStyle = isMe ? "#c4b5fd" : "#94a3b8";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(user.username || "", x, y + AVATAR_RADIUS + 6);

        // YOU badge
        if (isMe) {
          ctx.font = "bold 9px Arial";
          ctx.fillStyle = "#a78bfa";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("YOU", x, y - AVATAR_RADIUS - 6);
        }
      });

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
      canvas.removeEventListener("click", onClick);
    };
  }, []); // runs once

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, display: "block", cursor: "crosshair" }}
    />
  );
}
