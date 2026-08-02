import React, { useContext, useEffect, useState } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/Firebase-temp";
import { AppContext } from "../../context/AppContext";
const RightSidebar = () => {
  const { chatUser, messages,rightSidebarVisible,setRightSidebarVisible } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push({ type: "image", url: msg.image });
      }
      if (msg.video) {
        tempVar.push({ type: "video", url: msg.video });
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  const isOnline = chatUser && (Date.now() - chatUser.userData.lastSeen <= 70000);

  return chatUser ? (
  <div className={`rs ${rightSidebarVisible ? "visible" : ""}`}>
    <div className="rs-profile">
      <img
        onClick={() => setRightSidebarVisible(false)}
        src={assets.arrow_icon}
        className="arrow"
        alt=""
      />
      <div className={`avatar-wrapper ${isOnline ? "" : "offline"}`}>
        <div className="img-overlay-wrapper" style={{ width: "100px", aspectRatio: "1/1" }}>
          <img src={chatUser.userData.avatar} alt="" />
          <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
        </div>
      </div>
      <h3>
        {chatUser.userData.name}
      </h3>
      <div className={`status-badge ${isOnline ? "" : "offline"}`}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? 'var(--online)' : 'var(--text-muted)', display: 'inline-block' }}></span>
        {isOnline ? "Online" : "Offline"}
      </div>
      <p>{chatUser.userData.bio}</p>
    </div>

    <hr />
    <div className="rs-media">
      <p>Shared Media</p>
      <div>
        {msgImages.length === 0 && (
          <span style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0' }}>No media shared yet</span>
        )}
        {msgImages.map((media, index) =>
          media.type === "image" ? (
            <img
              onClick={() => window.open(media.url)}
              key={index}
              src={media.url}
              alt=""
            />
          ) : (
            <video key={index} src={media.url} controls />
          )
        )}
      </div>
    </div>
    <button onClick={() => logout()}>Logout</button>
  </div>
) : (
  <div className={`rs ${rightSidebarVisible ? "visible" : ""}`}>
    <button onClick={() => logout()} style={{ marginTop: 'auto' }}>Logout</button>
  </div>
);

};

export default RightSidebar;
