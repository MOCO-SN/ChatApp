import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";
import { LeftSidebar } from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";
const Chat = () => {
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);
  return (
    <div className="chat">
      {loading && (
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      )}
      <div className="chat-wrapper">
        {loading ? (
          <div className="loading-screen">
            <p className="loading">Loading to your chats...</p>
          </div>
        ) : (
          <div className="chat-container">
            <LeftSidebar />
            <ChatBox />
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
