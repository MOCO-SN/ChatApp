import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  const formatChatListTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

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
                className="user-avatar-img"
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
                <div className="friend-name-row">
                  <p className="friend-name">{user.name}</p>
                  {user.accountType === "business" && (
                    <span className="friend-business-badge">Business</span>
                  )}
                </div>
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
                    <div className="friend-name-row">
                      <p className="friend-name">{item.userData.name}</p>
                      {item.userData.accountType === "business" && (
                        <span className="friend-business-badge">Business</span>
                      )}
                    </div>
                    <div className="friend-row">
                      <span className={`friend-last ${isUnread ? "unread" : ""}`}>
                        {item.lastMessage || "No messages yet"}
                      </span>
                      {item.updatedAt ? (
                        <span className="friend-time">
                          {formatChatListTime(item.updatedAt)}
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
          
      {showUserMenu &&
        createPortal(
          <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)}>
            <div className="user-menu-popup" onClick={(e) => e.stopPropagation()}>
              <button
                className="user-menu-close-btn"
                onClick={() => setShowUserMenu(false)}
                aria-label="Close profile popup"
              >
                ✕
              </button>

              <div className="user-menu-header">
                <div className="user-menu-banner"></div>
                <div className="user-menu-avatar-wrap">
                  <div className="img-overlay-wrapper user-menu-avatar">
                    <img src={userData?.avatar} alt={userData?.name} />
                    <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                  <span className="user-menu-online-indicator"></span>
                </div>

                <div className="user-menu-title-area">
                  <h2 className="user-name">{userData?.name || "User"}</h2>
                  <div
                    className="user-username-badge"
                    onClick={() => {
                      if (userData?.username) {
                        navigator.clipboard.writeText(`@${userData.username}`);
                        toast.success("Username copied to clipboard!");
                      }
                    }}
                    title="Click to copy username"
                  >
                    <span>@{userData?.username || "username"}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </div>

                  <div className="user-menu-tag-row">
                    <span className={`user-badge ${userData?.accountType === "business" ? "business" : "personal"}`}>
                      {userData?.accountType === "business" ? "🏢 Business Account" : "👤 Personal"}
                    </span>
                    <span className="user-status-pill online">
                      <span className="status-dot"></span>
                      Active Now
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-menu-body">
                {userData?.bio && (
                  <div className="user-menu-section bio-section">
                    <span className="section-label">About</span>
                    <p className="user-bio-text">{userData.bio}</p>
                  </div>
                )}

                <div className="user-menu-section details-section">
                  <span className="section-label">Contact & Info</span>
                  {userData?.email && (
                    <div className="user-detail-row">
                      <div className="detail-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                      </div>
                      <div className="detail-text-col">
                        <span className="detail-name">Email</span>
                        <span className="detail-val">{userData.email}</span>
                      </div>
                    </div>
                  )}

                  {userData?.phone && (
                    <div className="user-detail-row">
                      <div className="detail-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <div className="detail-text-col">
                        <span className="detail-name">Phone</span>
                        <span className="detail-val">{userData.phone}</span>
                      </div>
                    </div>
                  )}

                  {userData?.accountType === "business" && (
                    <>
                      {userData?.companyName && (
                        <div className="user-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <path d="M3 9h18"/>
                              <path d="M9 21V9"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Company</span>
                            <span className="detail-val">{userData.companyName}</span>
                          </div>
                        </div>
                      )}
                      {userData?.industry && (
                        <div className="user-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Industry</span>
                            <span className="detail-val">{userData.industry}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="user-detail-row encryption-badge-row">
                    <div className="detail-icon-box e2ee-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div className="detail-text-col">
                      <span className="detail-name">Privacy & Keys</span>
                      <span className="detail-val e2ee-text">End-to-End Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-menu-footer">
                <button
                  type="button"
                  className="user-menu-btn edit-profile-btn"
                  onClick={() => {
                    navigate("/profile");
                    setShowUserMenu(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  className="user-menu-btn logout-btn"
                  onClick={() => logout()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
