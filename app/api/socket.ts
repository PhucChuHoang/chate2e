// pages/api/socket.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { Socket } from "net";

interface ExtendedNextApiResponse extends NextApiResponse {
  socket: Socket & { server: HttpServer & { io: IOServer } };
}

let connectedUsers: { id: string; name: string }[] = [];

export default function SocketHandler(req: NextApiRequest, res: ExtendedNextApiResponse) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // Add new user when they connect
      const userName = `User${connectedUsers.length + 1}`;
      connectedUsers.push({ id: socket.id, name: userName });
      io.emit("users", connectedUsers);

      // Remove user when they disconnect
      socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
        io.emit("users", connectedUsers);
      });

      // Handle chat message event
      socket.on("chatMessage", ({ message, to }) => {
        io.to(to).emit("receiveMessage", { message, from: socket.id });
      });
    });
  }

  res.end();
}
