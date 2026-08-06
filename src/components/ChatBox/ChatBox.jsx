import React, { useContext, useEffect, useRef, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/Firebase-temp";
import { toast } from "react-toastify";
import uploadToCloudinary from "../../lib/cloudinary";
import E2EE from "../../lib/e2ee";

const ChatBox = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBusinessPanel, setShowBusinessPanel] = useState(false);
  const [businessTemplate, setBusinessTemplate] = useState("invoice");
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);
  const sendingRef = useRef(false);
  const textareaRef = useRef(null);

  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
    chatData,
    setRightSidebarVisible,
  } = useContext(AppContext);

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesEndRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior, block: "end" });
    });
  };

  const updateChatLastMessage = async (lastMessageText) => {
    if (!chatUser) return;

    const userIDs = [chatUser.rId, userData.id];
    for (const id of userIDs) {
      try {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (!userChatsSnapshot.exists()) continue;

        const userChatData = userChatsSnapshot.data();
        const chatIndex = userChatData.chatsData.findIndex(
          (c) => c.messagesId === messagesId
        );

        if (chatIndex === -1) continue;

        userChatData.chatsData[chatIndex].lastMessage = lastMessageText.slice(0, 30);
        userChatData.chatsData[chatIndex].updatedAt = Date.now();

        if (userChatData.chatsData[chatIndex].rId === userData.id) {
          userChatData.chatsData[chatIndex].messageSeen = false;
        } else {
          userChatData.chatsData[chatIndex].messageSeen = true;
        }

        await updateDoc(userChatsRef, {
          chatsData: userChatData.chatsData,
        });
      } catch (error) {
        console.error("Failed to update chat last message for user", id, error);
      }
    }
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !messagesId || !chatUser || sendingRef.current) return;
    sendingRef.current = true;

    try {
      const e2eePayload = await (async () => {
        try {
          const recipientDoc = await getDoc(doc(db, "users", chatUser.rId));
          if (recipientDoc.exists() && recipientDoc.data()?.publicKey) {
            return await E2EE.encrypt(textToSend, recipientDoc.data().publicKey);
          }
        } catch (e2eeError) {
          console.warn("E2EE encrypt failed, sending plaintext fallback:", e2eeError);
        }
        return null;
      })();

      const messageData = {
        sId: userData.id,
        createdAt: new Date(),
        status: "sent",
        ...(e2eePayload ? { e2ee: e2eePayload } : { text: textToSend }),
      };

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(messageData),
      });

      updateChatLastMessage(textToSend).catch((err) => {
        console.error("Failed to update chat last message:", err);
      });

      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      sendingRef.current = false;
    }
  };

  const sendImage = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file || !messagesId || !chatUser) return;

      const fileUrl = await uploadToCloudinary(file);

      if (fileUrl && messagesId) {
        const messageData = {
          sId: userData.id,
          ...(file.type.startsWith("video") ? { video: fileUrl } : { image: fileUrl }),
          createdAt: new Date(),
          status: "sent",
          ...(userData.accountType === "business" ? { messageType: "media" } : {}),
        };

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion(messageData),
        });

        const lastMessageText = file.type.startsWith("video") ? "Video" : "Image";
        updateChatLastMessage(lastMessageText).catch((err) => {
          console.error("Failed to update chat last message:", err);
        });
      }
    } catch (error) {
      toast.error("Failed to send media: " + error.message);
    }
  };

  const sendBusinessMessage = async (templateType, data) => {
    if (!messagesId || !chatUser || sendingRef.current) return;
    sendingRef.current = true;

    try {
      let messageText = "";
      let messageType = "business";

      if (templateType === "invoice") {
        messageText = `📄 INVOICE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `Invoice #: ${data.invoiceNumber || "INV-001"}\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}\n` +
          `-------------------\n` +
          `Items:\n${data.items || "Services rendered"}\n` +
          `-------------------\n` +
          `Total: ${data.amount || "0.00"}\n` +
          `Status: ${data.status || "Pending"}\n` +
          `\nThank you for your business!`;
      } else if (templateType === "notice") {
        messageText = `📢 NOTICE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `Subject: ${data.subject || "Important Notice"}\n` +
          `-------------------\n` +
          `${data.message || ""}\n` +
          `-------------------\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}\n` +
          `For queries, contact us.`;
      } else if (templateType === "data") {
        messageText = `📊 DATA UPDATE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `${data.title || "Information"}\n` +
          `-------------------\n` +
          `${data.content || ""}\n` +
          `-------------------\n` +
          `Reference: ${data.reference || "N/A"}\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}`;
      }

      const messageData = {
        sId: userData.id,
        text: messageText,
        createdAt: new Date(),
        status: "sent",
        messageType,
        templateType,
        ...(userData.accountType === "business" ? { senderCompany: data.companyName || userData.name } : {}),
      };

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(messageData),
      });

      updateChatLastMessage(messageText.split("\n")[0]).catch((err) => {
        console.error("Failed to update chat last message:", err);
      });

      setShowBusinessPanel(false);
    } catch (error) {
      toast.error("Failed to send business message: " + error.message);
    } finally {
      sendingRef.current = false;
    }
  };

  const deleteMessage = async (index, msg) => {
    if (!messagesId || !msg) return;

    try {
      const msgRef = doc(db, "messages", messagesId);
      const msgSnap = await getDoc(msgRef);

      if (!msgSnap.exists()) return;

      const msgData = msgSnap.data();
      const updatedMessages = msgData.messages.filter((_, i) => i !== index);

      await updateDoc(msgRef, { messages: updatedMessages });
      setMessages(updatedMessages);
      toast.success("Message deleted");

      const lastMsg = updatedMessages[updatedMessages.length - 1];
      const newLastMessage = lastMsg
        ? (lastMsg.text || (lastMsg.image ? "Image" : lastMsg.video ? "Video" : ""))
        : "";

      await updateChatLastMessage(newLastMessage);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const getTickIcon = (msg) => {
    const isOwnMessage = msg.sId === userData.id;
    if (!isOwnMessage) return "";

    const status = msg.status || "sent";
    const chatSeen =
      chatData?.find((c) => c.messagesId === messagesId)?.messageSeen || false;

    if (status === "read" || (status === "delivered" && chatSeen)) {
      return "✓✓";
    }

    if (status === "delivered" || (status === "sent" && chatSeen)) {
      return "✓✓";
    }

    return "✓";
  };

  const getTickClassName = (msg) => {
    const isOwnMessage = msg.sId === userData.id;
    if (!isOwnMessage) return "";

    const status = msg.status || "sent";
    const chatSeen =
      chatData?.find((c) => c.messagesId === messagesId)?.messageSeen || false;

    if (status === "read" || (status === "delivered" && chatSeen)) {
      return "tick tick-blue";
    }

    return "tick";
  };

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return "";
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    } else {
      return (hour === 0 ? 12 : hour) + ":" + minute + "AM";
    }
  };

  useEffect(() => {
    if (!messagesId) return;

    setMessages([]);
    isFirstLoad.current = true;

    setTimeout(() => {
      const chatMsg = document.querySelector(".chat-msg");
      if (chatMsg) {
        chatMsg.scrollTop = chatMsg.scrollHeight;
      }
    }, 0);

    const unSub = onSnapshot(doc(db, "messages", messagesId), async (res) => {
      const msgs = res.data()?.messages || [];
      const decrypted = await Promise.all(
        msgs.map(async (msg) => {
          if (msg.e2ee) {
            try {
              const keyPair = await E2EE.getOrCreateKeyPair();
              const text = await E2EE.decrypt(msg.e2ee, keyPair.privateKey);
              return { ...msg, text };
            } catch (err) {
              console.error("Decryption failed for message:", err);
              return { ...msg, text: "[Encrypted message - unable to decrypt]" };
            }
          }
          return msg;
        })
      );
      setMessages(decrypted);

      const lastMsg = decrypted[decrypted.length - 1];
      if (lastMsg && lastMsg.sId !== userData.id && lastMsg.status === "sent") {
        const msgRef = doc(db, "messages", messagesId);
        const msgData = res.data();
        const updatedMessages = [...(msgData.messages || [])];
        const lastMsgIndex = updatedMessages.length - 1;
        if (lastMsgIndex >= 0) {
          updatedMessages[lastMsgIndex] = { ...lastMsg, status: "delivered" };
          updateDoc(msgRef, { messages: updatedMessages }).catch(() => {});
        }
      }
    });
    return () => {
      unSub();
    };
  }, [messagesId]);

  useEffect(() => {
    if (chatUser && messagesId) {
      const chatUserDocRef = doc(db, "chats", chatUser.rId);
      getDoc(chatUserDocRef).then((snap) => {
        if (!snap.exists()) return;
        const chatData = snap.data();
        const chatIndex = chatData.chatsData.findIndex(
          (c) => c.messagesId === messagesId
        );
        if (chatIndex === -1) return;
        if (!chatData.chatsData[chatIndex].messageSeen) {
          updateDoc(chatUserDocRef, {
            chatsData: arrayRemove(chatData.chatsData[chatIndex]),
          }).catch(() => {});

          const updatedChat = { ...chatData.chatsData[chatIndex], messageSeen: true };
          updateDoc(chatUserDocRef, {
            chatsData: arrayUnion(updatedChat),
          }).catch(() => {});
        }
      });
    }
  }, [messages, messagesId, chatUser]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) {
      scrollToBottom("instant");
      isFirstLoad.current = false;
    } else {
      scrollToBottom("smooth");
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current && !input) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  const EMOJIS = [
    "😀","😂","😊","😍","🥰","😘","😎","🤔","😢","😡",
    "👍","👎","❤️","🔥","🎉","👏","🙏","💪","🌟","⭐",
    "🎈","🎁","🏆","💯","✨","🌈","☀️","🌙","⚡","💡",
    "🎵","🎶","📱","💻","📷","🎥","🎮","⚽","🏀","🎯",
    "🚀","✈️","🍕","🍔","🍟","🌮","🍩","🍰","☕","🍺",
    "💊","💉","🏠","🚗","⌚","🔒","🔑","💰","💎","📚",
    "✏️","📝","📌","📎","🔗","💬","👋","🤝","🙌","👌",
    "✌️","🤞","👆","👇","👈","👉","💔","💕","💖","💗",
    "💓","💝","💘","💟","♥️","❣️","❤️‍🔥","💯","💢","💥",
    "💫","💦","💨","🕳️","💣","💬","👤","👥","👣","🧠",
    "👀","👁️","👅","👄","🦷","👂","🦻","👃","🦶","🦵",
    "🦿","🧍","🧎","🧑","👶","👦","👧","🧒","👩","👨",
    "👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇",
    "🤦","🤷","👨‍⚕️","👩‍⚕️","👨‍🎓","👩‍🎓","👨‍🏫","👩‍🏫",
    "👨‍⚖️","👩‍⚖️","👨‍🌾","👩‍🌾","👨‍🍳","👩‍🍳","👨‍🔧","👩‍🔧",
    "👨‍🏭","👩‍🏭","👨‍💼","👩‍💼","👨‍🔬","👩‍🔬","👨‍💻","👩‍💻",
    "👨‍🎤","👩‍🎤","👨‍🎨","👩‍🎨","👨‍✈️","👩‍✈️","👨‍🚀","👩‍🚀",
    "👨‍🚒","👩‍🚒","👮","🕵️","💂","🥷","👷","🤴","👸",
    "👳","👲","🧕","🤰","🤱","👼","🎅","🤶","🦸","🦹",
    "🧙","🧚","🧛","🧜","🧝","🧞","🧟","💆","💇","🚶",
    "🧍","🧎","🏃","💃","🕺","🕴️","👯","🧖","🧘","🤵",
    "🙇","💁","🙅","🙆","🙋","🙌","🙏","✍️","💪","🦾",
    "🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷",
    "🦴","👀","👁️","👅","👄","💋","👶","🧒","👦","👧",
    "🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎",
    "🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","👨‍⚕️","👩‍⚕️",
    "👨‍🎓","👩‍🎓","👨‍🏫","👩‍🏫","👨‍⚖️","👩‍⚖️","👨‍🌾","👩‍🌾",
    "👨‍🍳","👩‍🍳","👨‍🔧","👩‍🔧","👨‍🏭","👩‍🏭","👨‍💼","👩‍💼",
    "👨‍🔬","👩‍🔬","👨‍💻","👩‍💻","👨‍🎤","👩‍🎤","👨‍🎨","👩‍🎨",
    "👨‍✈️","👩‍✈️","👨‍🚀","👩‍🚀","👨‍🚒","👩‍🚒"
  ];

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <div className="img-overlay-wrapper" style={{ width: "40px", aspectRatio: "1/1" }}>
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
          <div
            className={`user-status ${Date.now() - chatUser.userData.lastSeen <= 70000 ? "online" : ""}`}
          >
            {Date.now() - chatUser.userData.lastSeen <= 70000 ? "Online" : "Offline"}
          </div>
        </div>
        <div className="header-actions">
          <div className="icon-btn" onClick={() => setShowProfilePopup(true)}>
            <img src={assets.help_icon} className="help" alt="" />
          </div>
          <div className="icon-btn" onClick={() => setChatVisible(false)}>
            <img src={assets.arrow_icon} className="arrow" alt="" />
          </div>
        </div>
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sId === userData.id;
          return (
            <div
              key={(msg.createdAt?.seconds || msg.createdAt?.getTime?.() || Date.now()) + "-" + msg.sId + "-" + index}
              className={isOwnMessage ? "s-msg" : "r-msg"}
            >
              {msg["image"] ? (
                <img className="msg-img" src={msg.image} alt="" />
              ) : msg["video"] ? (
                <video className="msg-img" src={msg.video} controls />
              ) : (
                <p className="msg">
                  {msg.text}
                  <span className="msg-bottom">
                    <span className={getTickClassName(msg)}>
                      {getTickIcon(msg)}
                    </span>
                    <span className="msg-time">{convertTimestamp(msg.createdAt)}</span>
                  </span>
                </p>
              )}
              <div className="msg-meta">
                <div className="img-overlay-wrapper" style={{ width: "22px", aspectRatio: "1/1" }}>
                  <img
                    src={isOwnMessage ? userData.avatar : chatUser.userData.avatar}
                    alt=""
                  />
                  <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                </div>
              </div>
              <div
                className="delete-msg-btn"
                onClick={() => deleteMessage(index, msg)}
                title="Delete message"
              >
                ×
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          ref={textareaRef}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          value={input}
          placeholder="Send a message"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
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

        <div className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          😊
        </div>

        {userData?.accountType === "business" && (
          <div className="emoji-btn business-btn" onClick={() => setShowBusinessPanel(!showBusinessPanel)} title="Business Tools">
            🏢
          </div>
        )}

        <button type="button" className="send-btn" onClick={() => {
          const value = textareaRef.current?.value || input || "";
          if (value.trim()) sendMessage(value);
        }} aria-label="Send">
          <img src={assets.send_button} alt="Send" />
        </button>
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker-overlay" onClick={() => setShowEmojiPicker(false)}>
          <div className="emoji-picker" onClick={(e) => e.stopPropagation()}>
            <div className="emoji-grid">
              {EMOJIS.map((emoji, index) => (
                <span
                  key={index}
                  className="emoji-item"
                  onClick={() => {
                    setShowEmojiPicker(false);
                    sendMessage(emoji);
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {showBusinessPanel && userData?.accountType === "business" && (
        <div className="business-panel-overlay" onClick={() => setShowBusinessPanel(false)}>
          <div className="business-panel" onClick={(e) => e.stopPropagation()}>
            <div className="business-panel-header">
              <h3>Business Tools</h3>
              <span onClick={() => setShowBusinessPanel(false)}>×</span>
            </div>
            <div className="business-panel-body">
              <div className="business-template-tabs">
                <button
                  className={`template-tab ${businessTemplate === "invoice" ? "active" : ""}`}
                  onClick={() => setBusinessTemplate("invoice")}
                >
                  📄 Invoice
                </button>
                <button
                  className={`template-tab ${businessTemplate === "notice" ? "active" : ""}`}
                  onClick={() => setBusinessTemplate("notice")}
                >
                  📢 Notice
                </button>
                <button
                  className={`template-tab ${businessTemplate === "data" ? "active" : ""}`}
                  onClick={() => setBusinessTemplate("data")}
                >
                  📊 Data
                </button>
              </div>

              {businessTemplate === "invoice" && (
                <div className="template-form">
                  <input
                    id="invoice-company"
                    placeholder="Company Name"
                    defaultValue={userData.companyName || userData.name}
                  />
                  <input
                    id="invoice-number"
                    placeholder="Invoice # (e.g., INV-001)"
                    defaultValue="INV-001"
                  />
                  <input
                    id="invoice-items"
                    placeholder="Items / Services"
                    defaultValue="Services rendered"
                  />
                  <input
                    id="invoice-amount"
                    placeholder="Amount"
                    defaultValue="0.00"
                  />
                  <select id="invoice-status" defaultValue="Pending">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                  <button
                    className="send-template-btn"
                    onClick={() => {
                      const data = {
                        companyName: document.getElementById("invoice-company")?.value || userData.name,
                        invoiceNumber: document.getElementById("invoice-number")?.value,
                        items: document.getElementById("invoice-items")?.value,
                        amount: document.getElementById("invoice-amount")?.value,
                        status: document.getElementById("invoice-status")?.value,
                      };
                      sendBusinessMessage("invoice", data);
                    }}
                  >
                    Send Invoice
                  </button>
                </div>
              )}

              {businessTemplate === "notice" && (
                <div className="template-form">
                  <input
                    id="notice-company"
                    placeholder="Company Name"
                    defaultValue={userData.companyName || userData.name}
                  />
                  <input
                    id="notice-subject"
                    placeholder="Subject"
                    defaultValue="Important Notice"
                  />
                  <textarea
                    id="notice-message"
                    placeholder="Notice message..."
                    rows={4}
                    defaultValue=""
                  />
                  <button
                    className="send-template-btn"
                    onClick={() => {
                      const data = {
                        companyName: document.getElementById("notice-company")?.value || userData.name,
                        subject: document.getElementById("notice-subject")?.value,
                        message: document.getElementById("notice-message")?.value,
                      };
                      sendBusinessMessage("notice", data);
                    }}
                  >
                    Send Notice
                  </button>
                </div>
              )}

              {businessTemplate === "data" && (
                <div className="template-form">
                  <input
                    id="data-company"
                    placeholder="Company Name"
                    defaultValue={userData.companyName || userData.name}
                  />
                  <input
                    id="data-title"
                    placeholder="Title"
                    defaultValue="Information Update"
                  />
                  <textarea
                    id="data-content"
                    placeholder="Content..."
                    rows={4}
                    defaultValue=""
                  />
                  <input
                    id="data-reference"
                    placeholder="Reference #"
                    defaultValue="N/A"
                  />
                  <button
                    className="send-template-btn"
                    onClick={() => {
                      const data = {
                        companyName: document.getElementById("data-company")?.value || userData.name,
                        title: document.getElementById("data-title")?.value,
                        content: document.getElementById("data-content")?.value,
                        reference: document.getElementById("data-reference")?.value,
                      };
                      sendBusinessMessage("data", data);
                    }}
                  >
                    Send Data Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showProfilePopup && (
        <div className="profile-popup-overlay" onClick={() => setShowProfilePopup(false)}>
          <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
            <div className="profile-popup-header">
              <h3>Contact Info</h3>
              <span onClick={() => setShowProfilePopup(false)}>×</span>
            </div>
            <div className="profile-popup-body">
              <div
                className="img-overlay-wrapper"
                style={{ width: "100px", aspectRatio: "1/1", margin: "0 auto 10px" }}
              >
                <img src={chatUser.userData.avatar} alt="" />
                <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
              </div>
              <p className="profile-name">{chatUser.userData.name}</p>
              {chatUser.userData.username && (
                <p className="profile-username">@{chatUser.userData.username}</p>
              )}
              <p
                className={`profile-status ${Date.now() - chatUser.userData.lastSeen <= 70000 ? "online" : "offline"}`}
              >
                {Date.now() - chatUser.userData.lastSeen <= 70000 ? "Online" : "Offline"}
              </p>
              {chatUser.userData.bio && (
                <p className="profile-bio">{chatUser.userData.bio}</p>
              )}
              {chatUser.userData.accountType && (
                <p className={`profile-account-type ${chatUser.userData.accountType}`}>
                  {chatUser.userData.accountType === "business" ? "🏢 Business Account" : "👤 Personal Account"}
                </p>
              )}
              {chatUser.userData.accountType === "business" && (
                <div className="profile-business-info">
                  {chatUser.userData.companyName && (
                    <p><strong>Company:</strong> {chatUser.userData.companyName}</p>
                  )}
                  {chatUser.userData.industry && (
                    <p><strong>Industry:</strong> {chatUser.userData.industry}</p>
                  )}
                  {chatUser.userData.website && (
                    <p><strong>Website:</strong> {chatUser.userData.website}</p>
                  )}
                  {chatUser.userData.address && (
                    <p><strong>Address:</strong> {chatUser.userData.address}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
