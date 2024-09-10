import React, { useState, useEffect } from "react";
import { Message, User } from "../types/type";

interface ChatWindowProps {
  selectedUser: User | null;
  messages: Record<string, Message[]>;  // Record mapping user IDs to arrays of messages
  onSendMessage: (message: string) => void;
  currentUserId: string;  // Pass current user ID as a prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, messages, onSendMessage, currentUserId }) => {
  const [input, setInput] = useState<string>("");

  const handleSendMessage = () => {
    if (input && selectedUser) {
      onSendMessage(input);
      setInput("");
    }
  };

  // Retrieve messages for the selected user
  const userMessages = selectedUser ? messages[selectedUser.id] || [] : [];

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      {selectedUser ? (
        <>
          <h3>Chat with {selectedUser.name}, userId: {selectedUser.id}</h3>
          <div style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "20px" }}>
            {userMessages.length > 0 ? (
              userMessages.map((msg, idx) => (
                <div key={idx} style={{ margin: "10px 0" }}>
                  <b>{msg.from_user === currentUserId ? "Me" : selectedUser.name}</b>: {msg.message}
                </div>
              ))
            ) : (
              <p>No messages</p>
            )}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ marginRight: "10px", padding: "10px", width: "80%" }}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage} style={{ padding: "10px 20px" }}>
            Send
          </button>
        </>
      ) : (
        <p>Select a user to start chatting</p>
      )}
    </div>
  );
};

export default ChatWindow;
