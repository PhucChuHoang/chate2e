import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import { User } from "../types/type";

const SERVER_URL = "http://localhost:8000";


export const useSocket = () => {
  const { userName, addMessage, finished, userId, setUserId, messages } = useUser(); // Access userName and addMessage from context
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (userName && finished) {
      const socketInstance = io(SERVER_URL, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        socketInstance.emit("register_user", { name: userName });
      });

      socketInstance.on("users", (users: User[]) => {
        setUsers(users);
        
        users.forEach((user) => {
          if (user.name === userName) {
            setUserId(user.id);
          }
        });
      });

      socketInstance.on("receive_message", (message) => {
        addMessage(message);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [userName, finished]);

  const sendMessage = (message: string, toUserId: string) => {
    if (socket) {
      const newMessage = {
        message,
        from_user: userId,
        to_user: toUserId,
      };
      socket.emit("chat_message", newMessage);
      addMessage(newMessage); // Add the sent message to the global state
    }
  };

  return { users, sendMessage, messages };
};

export default useSocket;
