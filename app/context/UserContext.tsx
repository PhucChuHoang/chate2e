'use client'
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Message, User } from "../types/type";

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPassword: string;
  setUserPassword: (password: string) => void
  userId: string;
  setUserId: (id: string) => void;
  finished: boolean;
  setFinished: (finished: boolean) => void;
  messages: Record<string, Message[]>;
  addMessage: (message: Message) => void;
  setMessages: (messages: Record<string, Message[]>) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
  userPin: (number | undefined)[];
  setUserPin: (pin: (number | undefined)[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [finished, setFinished] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPin, setUserPin] = useState<(number | undefined)[]>(Array(6).fill(undefined));

  return (
    <UserContext.Provider
      value={{
        userName,
        setUserName,
        messages,
        addMessage: (message: Message) => {
          setMessages((prevMessages) => {
            const updatedMessages = {
              ...prevMessages,
              [message.to_user]: [...(prevMessages[message.to_user] || []), message],
              [message.from_user]: [...(prevMessages[message.from_user] || []), message],
            };
            return updatedMessages;
          });
        },
        finished,
        setFinished,
        userId,
        setUserId,
        userEmail,
        setUserEmail,
        userPassword,
        setUserPassword,
        setMessages,
        selectedUser,
        setSelectedUser,
        userPin,
        setUserPin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
