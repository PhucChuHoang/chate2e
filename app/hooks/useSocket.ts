import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";

interface User {
  id: string;
  name: string;
}

interface Message {
  message: string;
  from_user: string;
  to_user: string;
}

const useSocket = (userName: string, isDone: boolean) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    if (userName && isDone) {
      const socketInstance = io(SERVER_URL, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to the server");
        socketInstance.emit("register_user", { name: userName });
      });

      socketInstance.on("users", (users: User[]) => {
        setUsers(users);
      });

      socketInstance.on("receive_message", (message: Message) => {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [message.to_user]: [...(prevMessages[message.to_user] || []), message],
        }));
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [userName, isDone]);

  const sendMessage = (message: string, toUserId: string) => {
    if (socket) {
      socket.emit("chat_message", {
        message,
        from_user: userName,
        to_user: toUserId,
      });
    }
  };

  return { users, messages, sendMessage };
};

export default useSocket;
