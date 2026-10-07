import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/Firebase-temp";
import { AppContext } from "../../context/AppContext";

const RightSidebar = () => {
  const { chatUser, messages, rightSidebarVisible, setRightSidebarVisible } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [activeMediaFilter, setActiveMediaFilter] = useState("all"); // "all", "images", "videos"
  const [lightboxMedia, setLightboxMedia] = useState(null);

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push({ type: "image", url: msg.image, date: msg.createdAt });
      }
      if (msg.video) {
        tempVar.push({ type: "video", url: msg.video, date: msg.createdAt });
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  const showLastSeen = chatUser?.userData?.showLastSeen !== false;
  const isOnline = chatUser && showLastSeen && Date.now() - (chatUser.userData?.lastSeen || 0) <= 70000;
  const isBusiness = chatUser?.userData?.accountType === "business";

  const filteredMedia = msgImages.filter((item) => {
    if (activeMediaFilter === "images") return item.type === "image";
    if (activeMediaFilter === "videos") return item.type === "video";
    return true;
  });

  return (
    <>
      <div className={`rs ${rightSidebarVisible ? "visible" : ""}`}>
        {/* Header Bar */}
        <div className="rs-header-bar">
          <button
            type="button"
            className="rs-back-btn"
            onClick={() => setRightSidebarVisible(false)}
            title="Close details"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span className="rs-header-title">Contact Information</span>
        </div>

        {chatUser ? (
          <div className="rs-scrollable-content">
            {/* Profile Hero Section */}
            <div className="rs-profile-card">
              <div className={`rs-avatar-ring ${showLastSeen && isOnline ? "online" : "offline"}`}>
                <div className="img-overlay-wrapper rs-avatar">
                  <img src={chatUser.userData?.avatar} alt={chatUser.userData?.name} />
                  <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                </div>
                {showLastSeen && (
                  <span className={`rs-online-dot ${isOnline ? "online" : "offline"}`}></span>
                )}
              </div>

              <h3 className="rs-user-name">
                {chatUser.userData?.name || "User"}
              </h3>
              
              {chatUser.userData?.username && (
                <p className="rs-user-handle">@{chatUser.userData.username}</p>
              )}

              <div className="rs-badges-row">
                <span className={`rs-account-badge ${isBusiness ? "business" : "personal"}`}>
                  {isBusiness ? "🏢 Business" : "👤 Personal"}
                </span>
                {showLastSeen && (
                  <span className={`rs-status-pill ${isOnline ? "online" : "offline"}`}>
                    <span className="dot"></span>
                    {isOnline ? "Active Now" : "Offline"}
                  </span>
                )}
              </div>

              {chatUser.userData?.bio && chatUser.userData?.showBio !== false && (
                <div className="rs-bio-box">
                  <span className="rs-box-label">About</span>
                  <p className="rs-bio-text">{chatUser.userData.bio}</p>
                </div>
              )}

              {/* Contact Information (Email & Phone) */}
              {((chatUser.userData?.email && chatUser.userData?.showEmail !== false) ||
                (chatUser.userData?.phone && chatUser.userData?.showPhone !== false)) && (
                <div className="rs-contact-info-box">
                  <div className="rs-box-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span>Contact Details</span>
                  </div>

                  <div className="rs-business-details-list">
                    {chatUser.userData?.email && chatUser.userData?.showEmail !== false && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Email</span>
                        <span className="detail-val">{chatUser.userData.email}</span>
                      </div>
                    )}
                    {chatUser.userData?.phone && chatUser.userData?.showPhone !== false && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Phone</span>
                        <span className="detail-val">{chatUser.userData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Information Card */}
              {isBusiness && chatUser.userData?.showBusinessInfo !== false && (
                <div className="rs-business-info-box">
                  <div className="rs-box-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="3" rx="2"/>
                      <path d="M3 9h18"/>
                      <path d="M9 21V9"/>
                    </svg>
                    <span>Business Details</span>
                  </div>

                  <div className="rs-business-details-list">
                    {chatUser.userData?.companyName && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Company</span>
                        <span className="detail-val">{chatUser.userData.companyName}</span>
                      </div>
                    )}
                    {chatUser.userData?.industry && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Industry</span>
                        <span className="detail-val">{chatUser.userData.industry}</span>
                      </div>
                    )}
                    {chatUser.userData?.website && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Website</span>
                        <a
                          href={chatUser.userData.website.startsWith("http") ? chatUser.userData.website : `https://${chatUser.userData.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="detail-link"
                        >
                          {chatUser.userData.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {chatUser.userData?.address && (
                      <div className="rs-detail-item">
                        <span className="detail-key">Address</span>
                        <span className="detail-val">{chatUser.userData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security & Encryption Banner */}
              <div className="rs-security-note">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Messages are End-to-End Encrypted</span>
              </div>
            </div>

            {/* Shared Media Section */}
            <div className="rs-media-section">
              <div className="rs-media-header">
                <div className="rs-media-title-row">
                  <span className="rs-media-title">Shared Media</span>
                  <span className="rs-media-counter">{msgImages.length}</span>
                </div>

                {msgImages.length > 0 && (
                  <div className="rs-media-filters">
                    <button
                      type="button"
                      className={`filter-chip ${activeMediaFilter === "all" ? "active" : ""}`}
                      onClick={() => setActiveMediaFilter("all")}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${activeMediaFilter === "images" ? "active" : ""}`}
                      onClick={() => setActiveMediaFilter("images")}
                    >
                      Photos
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${activeMediaFilter === "videos" ? "active" : ""}`}
                      onClick={() => setActiveMediaFilter("videos")}
                    >
                      Videos
                    </button>
                  </div>
                )}
              </div>

              <div className="rs-media-grid">
                {filteredMedia.length === 0 ? (
                  <div className="rs-empty-media">
                    <div className="empty-icon-box">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                    <p className="empty-text">No shared media yet</p>
                    <span className="empty-sub">Photos and videos sent in this chat will appear here.</span>
                  </div>
                ) : (
                  filteredMedia.map((media, index) => (
                    <div
                      key={index}
                      className="rs-media-item"
                      onClick={() => setLightboxMedia(media)}
                    >
                      {media.type === "image" ? (
                        <img src={media.url} alt={`Shared media ${index + 1}`} loading="lazy" />
                      ) : (
                        <div className="rs-video-thumbnail">
                          <video src={media.url} preload="metadata" />
                          <div className="play-icon-overlay">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rs-no-user-selected">
            <p>Select a chat to inspect contact profile and shared media.</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="rs-footer-actions">
          <button
            type="button"
            className="rs-logout-btn"
            onClick={() => logout()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Media Lightbox Viewer Modal */}
      {lightboxMedia &&
        createPortal(
          <div className="media-lightbox-overlay" onClick={() => setLightboxMedia(null)}>
            <div className="media-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxMedia(null)}
                aria-label="Close viewer"
              >
                ✕
              </button>

              <div className="lightbox-media-wrapper">
                {lightboxMedia.type === "image" ? (
                  <img src={lightboxMedia.url} alt="Full view" className="lightbox-image" />
                ) : (
                  <video src={lightboxMedia.url} controls autoPlay className="lightbox-video" />
                )}
              </div>

              <div className="lightbox-toolbar">
                <a
                  href={lightboxMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lightbox-action-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  <span>Open Original</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default RightSidebar;
