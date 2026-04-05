import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../socket";

export function useSocket() {
  const [users, setUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [connections, setConnections] = useState(new Map()); // socketId → { username, avatarColor }
  const [messages, setMessages] = useState([]); // all proximity chat messages
  const [connected, setConnected] = useState(false);

  // Join the cosmos
  const join = useCallback((username, avatarColor) => {
    socket.connect();
    socket.emit("user:join", { username, avatarColor });
  }, []);

  // Move my avatar
  const move = useCallback((position) => {
    socket.emit("user:move", { position });
    setMyPosition(position);
  }, []);

  // Send a chat message to a specific peer
  const sendMessage = useCallback((toSocketId, message) => {
    socket.emit("chat:message", { toSocketId, message });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      setMySocketId(socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setConnections(new Map());
    });

    socket.on("user:joined", ({ userId, position }) => {
      setMyPosition(position);
    });

    socket.on("users:update", (userList) => {
      setUsers(userList);
    });

    socket.on("proximity:connected", ({ socketId, username, avatarColor }) => {
      setConnections((prev) => {
        const next = new Map(prev);
        next.set(socketId, { username, avatarColor });
        return next;
      });
    });

    socket.on("proximity:disconnected", ({ socketId }) => {
      setConnections((prev) => {
        const next = new Map(prev);
        next.delete(socketId);
        return next;
      });
      // Clear messages from that user
      setMessages((prev) =>
        prev.filter((m) => m.fromSocketId !== socketId)
      );
    });

    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev.slice(-100), msg]); // keep last 100
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user:joined");
      socket.off("users:update");
      socket.off("proximity:connected");
      socket.off("proximity:disconnected");
      socket.off("chat:message");
    };
  }, []);

  return {
    socket,
    mySocketId,
    myPosition,
    users,
    connections,
    messages,
    connected,
    join,
    move,
    sendMessage,
  };
}
