/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { useUser } from "../context/UserContext";
import { Message, User } from "../types/type";
//Use function from util
import { makeKeyArray, makeNewPrime, exponetional, PIN_encrypt } from "../util/util_math";
import { getEncryptData } from "../util/encrypt";
import { getDecryptedData, getDecryptedMessage } from "../util/decrypt";

const SERVER_URL = "http://localhost:8000";
const USER_PIN = [1, 2, 3, 5, 6, 7];

export const useSocket = () => {
  const { userName, userEmail, userPassword, addMessage, finished, setFinished, userId, setUserId, messages, selectedUser, setMessages } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const userPrimeNumberRef = useRef<bigint>(BigInt(0));
  const serverPrimeNumberRef = useRef<bigint>(BigInt(0));
  const secretKeyRef = useRef<bigint>(BigInt(0));

  const socketInstance = useRef<Socket | null>(null);
  useEffect(() => {
    if (finished) {
      socketInstance.current = io(SERVER_URL, {
        transports: ["websocket"],
      });

      socketInstance.current?.on("connect", () => {
        if (userName && userEmail && userPassword) {
          socketInstance.current?.emit(
              "authenticate", 
              { 
                username: userName, 
                email: userEmail, 
                password: userPassword, 
                method: "register"
              }
            );
        }
        else {
          socketInstance.current?.emit(
              "authenticate", 
              { 
                username: userName, 
                password: userPassword, 
                method: "login"
              }
            );
        }
      });

      socketInstance.current?.on("authenticate_fail", () => {
        setFinished(false);
        socketInstance.current?.disconnect();
      });

      socketInstance.current?.on("users", (users: User[]) => {
        setUsers(users);
        let currentUserId = "";
        users.forEach((user) => {
          if (user.name === userName) {
            setUserId(user.id);
            currentUserId = user.id;
          }
        });

        socketInstance.current?.emit("get_old_messages", { user_id: currentUserId });
      });

      socketInstance.on("old_messages", (oldMessages) => {
        setMessages({});
        oldMessages.forEach((message: Message) => {
          // message.message = getDecryptedMessage(message.message, key);
          addMessage(message);
        });
      });

      socketInstance.current?.on("receive_message", (message) => {
        console.log("UI Receive: " + message.message);
        const decryptMessage = getDecryptedMessage(message.message, makeKeyArray(secretKeyRef.current));
        const decryptMessageFormat = {
          message: decryptMessage,
          from_user: message.from_user,
          to_user: message.to_user,
        };
        addMessage(decryptMessageFormat);
      });

      //Receive old encrypted key from server
      socketInstance.current?.on("send_encrypt_key", (message) => {
        let key = message.message;
        console.log("received key: " + key);
        key = PIN_encrypt(key, USER_PIN);
        console.log("pin encrypt: " + key);
        secretKeyRef.current = BigInt(key);
      });

      socketInstance.current?.on("prime_number_message", (message) => {
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
        socketInstance.current?.emit("encrypt_key_message", newMessage);
      });

      socketInstance.current?.on("receive_encrypt_key", (message) => {
        const secretKey = exponetional(BigInt(message.message), BigInt(userPrimeNumberRef.current), BigInt(serverPrimeNumberRef.current));
        secretKeyRef.current = BigInt(secretKey);
        console.log("Secret key: " + secretKey);
        socketInstance.current?.emit("submit_secret_key", { encrypted_secret_key: PIN_encrypt(secretKey.toString(), USER_PIN), sender_id: message.to_user, receiver_id: message.from_user});
      });

      setSocket(socketInstance.current);

      return () => {
        socketInstance.current?.disconnect();
      };
    }
  }, [finished]);

  useEffect(() => {
    if (socketInstance.current) {
      console.log("Current chat user: " + selectedUser?.name);
      socketInstance.current.emit("exchange_public_key", { from_user: userId, to_user: selectedUser?.id });
    }
  }, [selectedUser])

  const sendMessage = (message: string, toUserId: string) => {
    let encryptMessage = "";
      const keyArray = makeKeyArray(secretKeyRef.current);
      const tempValue = getEncryptData(message, keyArray);
      console.log("UI Encrypt: ");
      for (let i = 0; i < tempValue.length; i++) {
        console.log(i + " string: " + tempValue[i]);
      }
      console.log("Local decrypt: " + getDecryptedData(tempValue, keyArray));
      encryptMessage = getEncryptData(message, keyArray).join('');
      //console.log("Local encrypt: " + encryptMessage);
    if (socket) {
      const newMessageLocal = {
        message: message,
        from_user: userId,
        to_user: toUserId,
      };
      const newMessage = {
        message: encryptMessage,
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
