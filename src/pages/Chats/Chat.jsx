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
      {/* Background Decorative Ambient Blobs */}
      <div className="chat-blob chat-blob-1"></div>
      <div className="chat-blob chat-blob-2"></div>

      {loading && (
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      )}

      <div className="chat-wrapper">
        {loading ? (
          <div className="chat-loading-screen">
            <div className="chat-loading-spinner"></div>
            <h3 className="loading-title">Connecting to MOCOSN CHAT</h3>
            <p className="loading-sub">Decrypting session and loading your messages...</p>
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
