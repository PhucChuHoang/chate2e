'use client'

import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";
import useSocket from "./hooks/useSocket";
import UserList from "./componets/UserList";
import ChatWindow from "./componets/ChatWindow";
import { useUser } from "./context/UserContext";

interface User {
  id: string;
  name: string;
}

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Initially hidden
  const {userName, setUserName} = useUser();
  const [isDone, setIsDone] = useState<boolean>(false);

  // Initialize socket connection only when a userName is set
  const { users, messages, sendMessage } = useSocket(userName, isDone);

  useEffect(() => {
    // Only run the modal logic on the client side
    if (typeof window !== "undefined") {
      setIsModalVisible(true);
    }
  }, []);

  const handleOk = () => {
    if (userName.trim()) {
      setIsDone(true);
      setIsModalVisible(false);
    } else {
      message.error("Please enter a valid name.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <UserList users={users} onSelectUser={setSelectedUser} />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        onSendMessage={(message: string) => selectedUser && sendMessage(message, selectedUser.id)}
      />
      {/* Render Modal only on client side */}
      <Modal
        title="Enter your name"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
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
