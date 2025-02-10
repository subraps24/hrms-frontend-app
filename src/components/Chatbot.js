import React, { useState } from "react";
import { ChatItem } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async () => {
    try {
      // Call the chatbot backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();

      // Update chat UI
      setMessages((prev) => [
        ...prev,
        { text: userInput, position: "right" },
        { text: data.reply, position: "left" },
      ]);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <div style={{ height: "400px", overflow: "auto" }}>
        {messages.map((msg, index) => (
          <ChatItem
            key={index}
            avatar={"https://example.com/avatar.png"}
            title={msg.position === "right" ? "You" : "Bot"}
            subtitle={msg.text}
          />
        ))}
      </div>
      <input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbot;
