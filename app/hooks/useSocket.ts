import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import { User } from "../types/type";
//Use function from util
import {makeNewKey, makeNewPrime, exponetional} from "../util/util_math";

const SERVER_URL = "http://localhost:8000";

export const useSocket = () => {
  const { userName, addMessage, finished, userId, setUserId, messages } = useUser(); // Access userName and addMessage from context
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const userPrimeNumberRef = useRef<bigint>(BigInt(0));
  const serverPrimeNumberRef = useRef<bigint>(BigInt(0));
  const secretKeyRef = useRef<bigint>(BigInt(0));

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

      socketInstance.on("prime_number_message", (message) => {
        //Log the message to the console
        let number = makeNewPrime(BigInt(message.prime_number));

        let encrypt = exponetional(BigInt(message.generator), BigInt(number), BigInt(message.prime_number));

        const newMessage = {
          message: encrypt.toString(),
          from_user: message.to_user,
          to_user: message.from_user,
        };

        userPrimeNumberRef.current = BigInt(number);
        serverPrimeNumberRef.current = BigInt(message.prime_number);

        console.log("Send: " + newMessage.message);
        socketInstance.emit("encrypt_key_message", newMessage);
      });

      socketInstance.on("receive_encrypt_key", (message) => {
        console.log("Receive: " + message.message);
        console.log("From: " + message.from_user);
        let secretKey = exponetional(BigInt(message.message), BigInt(userPrimeNumberRef.current), BigInt(serverPrimeNumberRef.current));
        console.log("Secret Key: " + secretKey);
        secretKeyRef.current = BigInt(secretKey);
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
