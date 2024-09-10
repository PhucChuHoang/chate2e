'use client';

import React, { useState, useEffect } from "react";
import { Modal, Input, message as antdMessage } from "antd";
import { useUser } from "./context/UserContext";
import useSocket from "./hooks/useSocket";
import UserList from "./componets/UserList";
import ChatWindow from "./componets/ChatWindow";
import { User } from "./types/type";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { userName, setUserName, setFinished, userId } = useUser();
  const { users, messages, sendMessage } = useSocket();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false); // New state to check client

  // useEffect to ensure this runs only on the client
  useEffect(() => {
    setIsClient(true); // Mark as client-side rendering
  }, []);

  const handleOk = () => {
    if (userName.trim()) {
      setIsModalVisible(false);
      setFinished(true);
    } else {
      antdMessage.error("Please enter a valid name.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  // Return null while waiting for client-side render to avoid hydration errors
  if (!isClient) return null;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <UserList users={users} onSelectUser={setSelectedUser} />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        onSendMessage={(message: string) =>
          selectedUser && sendMessage(message, selectedUser.id)
        }
        currentUserId={userId}
      />
      <Modal
        title="Enter your name"
        open={isModalVisible}
        onOk={handleOk}
        okText="Connect"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter your name"
          value={userName}
          onChange={handleInputChange}
        />
      </Modal>
    </div>
  );
}
