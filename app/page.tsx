'use client';

import React, { useState, useEffect } from "react";
import { Modal, Input, message as antdMessage, Form, Switch } from "antd";
import { useUser } from "./context/UserContext";
import useSocket from "./hooks/useSocket";
import UserList from "./componets/UserList";
import ChatWindow from "./componets/ChatWindow";

export default function Home() {
  const { userName, setUserName, finished, setFinished, userId, userEmail, setUserEmail, userPassword, setUserPassword, selectedUser, setSelectedUser, userPin, setUserPin } = useUser();
  const { users, messages, sendMessage } = useSocket();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true); // State to toggle between Sign Up and Login

  // useEffect to ensure this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (finished) {
      setIsModalVisible(false);
    } else {
      setIsModalVisible(true);
    }
  }, [finished]);

  const handleOk = () => {
    if (isSignUp) {
      // Sign-Up logic
      if (userName.trim() && userEmail.trim() && userPassword.trim() && userPin.every(pin => pin !== undefined && pin !== null)) {
        setIsModalVisible(false);
        setFinished(true);
      } else {
        antdMessage.error("Please fill in all the fields.");
      }
    } else {
      // Login logic
      if (userName.trim() && userPassword.trim()) {
        setIsModalVisible(false);
        setFinished(true);
      } else {
        antdMessage.error("Please enter valid credentials.");
      }
    }
  };

  const handleInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string (for deleting) or a valid single digit (0-9)
    if (value === '' || /^\d$/.test(value)) {
      const newPin = [...userPin];
      newPin[index] = value === '' ? undefined : Number(value);  // Update pin or clear
      setUserPin(newPin);
    }
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
        title={isSignUp ? "Sign Up" : "Login"}
        open={isModalVisible}
        onOk={handleOk}
        okText={isSignUp ? "Sign Up" : "Login"}
        cancelText="Cancel"
      >
        <Switch
          checkedChildren="Sign Up"
          unCheckedChildren="Login"
          checked={isSignUp}
          onChange={setIsSignUp}
          style={{ marginBottom: "16px" }}
        />
        <Form layout="vertical">
          <Form.Item label="Username">
            <Input
              placeholder="Enter your username"
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
          </Form.Item>
          {isSignUp && (
            <>
              <Form.Item label="Email">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                />
              </Form.Item>
            </>
          )}
          <Form.Item label="Password">
            <Input.Password
              placeholder="Enter your password"
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="PIN">
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={userPin[index] !== undefined ? String(userPin[index]) : ''}
                  onChange={handleInputChange(index)}
                  placeholder={`Digit ${index + 1}`}
                  style={{ width: '40px', textAlign: 'center' }} // Center-align the input text
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
