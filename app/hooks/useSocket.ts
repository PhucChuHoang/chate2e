import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import { User } from "../types/type";
//Use function from util
import { makeKeyArray, makeNewPrime, exponetional } from "../util/util_math";
import { getEncryptData } from "../util/encrypt";
import { getDecryptedData, getDecryptedMessage } from "../util/decrypt";

const SERVER_URL = "http://localhost:8000";

export const useSocket = () => {
  const { userName, userEmail, userPassword, addMessage, finished, setFinished, userId, setUserId, messages } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const userPrimeNumberRef = useRef<bigint>(BigInt(0));
  const serverPrimeNumberRef = useRef<bigint>(BigInt(0));
  const secretKeyRef = useRef<bigint>(BigInt(0));

  useEffect(() => {
    if (finished) {
      const socketInstance = io(SERVER_URL, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        socketInstance.emit(
            "authenticate", 
            { 
              username: userName, 
              email: userEmail, 
              password: userPassword, 
              method: "register"
            }
          );
      });

      socketInstance.on("authenticate_fail", () => {
        setFinished(false);
        socketInstance.disconnect();
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
        if (secretKeyRef.current === BigInt(0)) {
          addMessage(message);
          return;
        }
        console.log("UI Receive: " + message.message);
        const decryptMessage = getDecryptedMessage(message.message, makeKeyArray(secretKeyRef.current));
        const decryptMessageFormat = {
          message: decryptMessage,
          from_user: message.from_user,
          to_user: message.to_user,
        };
        addMessage(decryptMessageFormat);
      });

      socketInstance.on("prime_number_message", (message) => {
        const number = makeNewPrime(BigInt(message.prime_number));

        const encrypt = exponetional(BigInt(message.generator), BigInt(number), BigInt(message.prime_number));

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
        const secretKey = exponetional(BigInt(message.message), BigInt(userPrimeNumberRef.current), BigInt(serverPrimeNumberRef.current));
        secretKeyRef.current = BigInt(secretKey);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [finished]);

  const sendMessage = (message: string, toUserId: string) => {
    let encryptMessage = "";
    if (secretKeyRef.current !== BigInt(0)) {
      const keyArray = makeKeyArray(secretKeyRef.current);
      const tempValue = getEncryptData(message, keyArray);
      console.log("UI Encrypt: ");
      for (let i = 0; i < tempValue.length; i++) {
        console.log(i + " string: " + tempValue[i]);
      }
      console.log("Local decrypt: " + getDecryptedData(tempValue, keyArray));
      encryptMessage = getEncryptData(message, keyArray).join('');
      //console.log("Local encrypt: " + encryptMessage);
    }
    if (socket) {
      const newMessageLocal = {
        message: message,
        from_user: userId,
        to_user: toUserId,
      };
      const newMessage = {
        message: encryptMessage? encryptMessage : message,
        from_user: userId,
        to_user: toUserId,
      };
      socket.emit("chat_message", newMessage);
      addMessage(newMessageLocal); // Add the sent message to the global state
    }
  };

  return { users, sendMessage, messages };
};

export default useSocket;
