// components/ChatWindow.tsx

import React, { useState } from "react";

interface User {
  id: string;
  name: string;
}

interface Message {
  message: string;
  from_user: string;  // Should match with how you send/receive messages
  to_user: string;    // This might not be used in the display, but is necessary for storage
}

interface ChatWindowProps {
  selectedUser: User | null;
  messages: Record<string, Message[]>;  // Record mapping user IDs to arrays of messages
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, messages, onSendMessage }) => {
  const [input, setInput] = useState<string>("");

  const handleSendMessage = () => {
    if (input && selectedUser) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      {selectedUser ? (
        <>
          <h3>Chat with {selectedUser.name}</h3>
          <div style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "20px" }}>
            {messages[selectedUser.id]?.map((msg, idx) => (
              <div key={idx} style={{ margin: "10px 0" }}>
                <b>{msg.from_user === "YourName" ? "Me" : selectedUser.name}</b>: {msg.message}
              </div>
            ))}
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
