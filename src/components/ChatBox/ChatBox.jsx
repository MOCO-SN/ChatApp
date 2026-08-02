import React, { useContext, useEffect, useRef, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/Firebase-temp";
import { toast } from "react-toastify";
import uploadToCloudinary from "../../lib/cloudinary";

const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
    rightSidebarVisible,
    setRightSidebarVisible,

  } = useContext(AppContext);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesEndRef.current;
    if (!el) return;
    // Ensure content is rendered before scrolling
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior, block: "end" });
    });
  };

  const sendMessage = async () => {
  try {
    if (!input || !messagesId) return;

    
    await updateDoc(doc(db, "messages", messagesId), {
      messages: arrayUnion({
        sId: userData.id,
        text: input,
        createdAt: new Date(),
      }),
    });

    
    const userIDs = [chatUser.rId, userData.id];

    for (const id of userIDs) {
      const userChatsRef = doc(db, "chats", id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (!userChatsSnapshot.exists()) continue;

      const userChatData = userChatsSnapshot.data();
      const chatIndex = userChatData.chatsData.findIndex(
        (c) => c.messagesId === messagesId
      );

      if (chatIndex === -1) continue;

      
      userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
      userChatData.chatsData[chatIndex].updatedAt = Date.now();

      if (userChatData.chatsData[chatIndex].rId === userData.id) {
        userChatData.chatsData[chatIndex].messageSeen = false;
      }

      await updateDoc(userChatsRef, {
        chatsData: userChatData.chatsData,
      });

      
    }

    
    setInput("");
  } catch (error) {
    toast.error(error.message);
  }
};


  const sendImage = async (e) => {
    try {
      const file = e.target.files[0]; 
      const fileUrl = await uploadToCloudinary(file);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            [file.type.startsWith("video") ? "video" : "image"]: fileUrl, // 👈 dynamic key
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage =
              file.type.startsWith("video") ? "Video" : "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    } else {
      return hour + ":" + minute + "AM";
    }
  };

  useEffect(() => {
    if (!messagesId) return;

    // Clear old messages and reset scroll state
    setMessages([]);
    isFirstLoad.current = true;

    // Reset scroll position to bottom immediately when switching chats
    setTimeout(() => {
      const chatMsg = document.querySelector(".chat-msg");
      if (chatMsg) {
        chatMsg.scrollTop = chatMsg.scrollHeight;
      }
    }, 0);

    const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
      const msgs = res.data()?.messages || [];
      setMessages(msgs);
    });
    return () => {
      unSub();
    };
  }, [messagesId]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) {
      // Jump instantly to bottom when opening a chat
      scrollToBottom("instant");
      isFirstLoad.current = false;
    } else {
      // Smooth scroll only for new incoming messages
      scrollToBottom("smooth");
    }
  }, [messages]);
  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <div className="img-overlay-wrapper" style={{ width: '40px', aspectRatio: '1/1' }}>
          <img src={chatUser.userData.avatar} alt="" />
          <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
        </div>
        <div className="user-info" onClick={() => setRightSidebarVisible(true)}>
          <div className="user-name">
            {chatUser.userData.name}
            {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
              <span className="dot"></span>
            ) : null}
          </div>
          <div className={`user-status ${Date.now() - chatUser.userData.lastSeen <= 70000 ? 'online' : ''}`}>
            {Date.now() - chatUser.userData.lastSeen <= 70000 ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="header-actions">
          <div className="icon-btn">
            <img src={assets.help_icon} className="help" alt="" />
          </div>
          <div className="icon-btn" onClick={() => setChatVisible(false)}>
            <img src={assets.arrow_icon} className="arrow" alt="" />
          </div>
        </div>
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={msg.createdAt?.seconds + "-" + msg.sId || index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            {msg["image"] ? (
              <img className="msg-img" src={msg.image} alt="" />
            ) : msg["video"] ? (
              <video className="msg-img" src={msg.video} controls />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div className="msg-meta">
              <div className="img-overlay-wrapper" style={{ width: '22px', aspectRatio: '1/1' }}>
                <img
                  src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                  alt=""
                />
                <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
              </div>
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg, video/mp4, video/webm"
          hidden
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat Anytime, Anywhere</p>
      <p>Select a conversation to start messaging</p>
    </div>
  );
};

export default ChatBox;
