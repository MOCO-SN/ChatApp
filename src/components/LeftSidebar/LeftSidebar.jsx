import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, logout } from "../../config/Firebase-temp";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [ShowSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(
          userRef,
          where("username", "==", input.toLowerCase().trim())
        );
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const searchedUser = querySnap.docs[0].data();

          const userExist = chatData?.some(
            (chat) =>
              chat.rId === searchedUser.id ||
              chat.userData?.username?.toLowerCase().trim() ===
                searchedUser.username.toLowerCase().trim()
          );

          if (!userExist) {
            setUser(searchedUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();

      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });

      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

    const setChat = async (item) => {
    try {
      setMessagesId(item.messagesId);
      setChatUser(item);

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messagesId === item.messagesId
      );

      userChatsData.chatsData[chatIndex].messageSeen = true;

      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });

      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteChat = async (item) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        const userChatsRef = doc(db, "chats", userData.id);
        const otherUserChatsRef = doc(db, "chats", item.userData.id);
        
        const userChatsSnap = await getDoc(userChatsRef);
        const otherUserChatsSnap = await getDoc(otherUserChatsRef);
        
        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();
          const updatedUserChats = userChatsData.chatsData.filter(
            chat => chat.rId !== item.userData.id
          );
          await updateDoc(userChatsRef, { chatsData: updatedUserChats });
        }
        
        if (otherUserChatsSnap.exists()) {
          const otherUserChatsData = otherUserChatsSnap.data();
          const updatedOtherUserChats = otherUserChatsData.chatsData.filter(
            chat => chat.rId !== userData.id
          );
          await updateDoc(otherUserChatsRef, { chatsData: updatedOtherUserChats });
        }
        
        if (chatUser && chatUser.userData.id === item.userData.id) {
          setMessagesId("");
          setChatUser(null);
          setChatVisible(false);
        }
        
        toast.success("Chat deleted");
      } catch {
        toast.error("Failed to delete chat");
      }
    }
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        setChatUser((prev) => ({
          ...prev,
          userData: userData,
        }));
      }
    };
    updateChatUserData();
  }, [chatData]);

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <div 
              className="user-avatar-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(true);
              }}
            >
              <img 
                src={userData?.avatar} 
                alt=""
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search or start a new chat"
          />
        </div>
      </div>

      <div className="ls-list">
        {ShowSearch && user ? (
          <div
            onClick={addChat}
            className="friends add-user"
            style={{ cursor: "pointer" }}
          >
            <div className="img-overlay-wrapper ls-avatar">
              <img src={user.avatar} alt="" />
              <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
            </div>
            <div className="friend-info">
              <p className="friend-name">{user.name}</p>
              <span className="friend-status">Click to start chat</span>
            </div>
          </div>
        ) : (
          chatData.map((item, index) => {
            if (!item.userData) return null;
            const isUnread = !(item.messageSeen || item.messagesId === messagesId);
            return (
              <div
                key={index}
                className={`friends ${isUnread ? "border unread" : ""}`}
              >
                <div
                  onClick={() => setChat(item)}
                  className="friend-card-main"
                  style={{ cursor: "pointer", flex: 1 }}
                >
                  <div className={`img-overlay-wrapper ls-avatar ${isUnread ? "online-dot" : ""}`}>
                    <img src={item.userData.avatar} alt="" />
                    <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                    {isUnread ? <span className="unread-badge"></span> : null}
                  </div>
                  <div className="friend-info">
                    <p className="friend-name">{item.userData.name}</p>
                    <div className="friend-row">
                      <span className={`friend-last ${isUnread ? "unread" : ""}`}>
                        {item.lastMessage || "No messages yet"}
                      </span>
                      {item.updatedAt ? (
                        <span className="friend-time">
                          {new Date(item.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                      {isUnread ? (
                        <span className="unread-count-badge">1</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(item);
                  }}
                  title="Delete chat"
                >
                  ×
                </div>
              </div>
            );
          })
        )}
      </div>
          
      {showUserMenu && (
        <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)}>
          <div className="user-menu-popup" onClick={(e) => e.stopPropagation()}>
            <div className="user-menu-header">
              <div className="img-overlay-wrapper" style={{ width: '80px', height: '80px', margin: '0 auto 12px' }}>
                <img src={userData?.avatar} alt="" />
                <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
              </div>
              <h2 className="user-name">{userData?.name || "User"}</h2>
              <p className="user-username">@{userData?.username || "username"}</p>
              <p className="user-phone">{userData?.phone || "No phone number"}</p>
              <div className={`user-status ${Date.now() - (userData?.lastSeen || 0) <= 70000 ? 'online' : 'offline'}`}>
                <span className="status-indicator"></span>
                {Date.now() - (userData?.lastSeen || 0) <= 70000 ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="user-menu-options">
              <div className="user-menu-item" onClick={() => { navigate("/profile"); setShowUserMenu(false); }}>
                <span className="menu-icon"></span>
                Edit Profile
              </div>
              <div className="user-menu-item logout" onClick={() => logout()}>
                <span className="menu-icon"></span>
                Logout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
