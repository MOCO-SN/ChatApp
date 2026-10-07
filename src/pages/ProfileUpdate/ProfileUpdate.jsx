import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/Firebase-temp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { uploadToCloudinary } from "../../lib/cloudinary";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [uid, setUid] = useState("");
  const [accountType, setAccountType] = useState("personal");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Privacy & Security Toggles
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showBio, setShowBio] = useState(true);
  const [showBusinessInfo, setShowBusinessInfo] = useState(true);

  const { setUserData } = useContext(AppContext);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    let result = "+91";
    if (digits.length >= 1) {
      result += " " + digits.substring(0, 5);
    }
    if (digits.length > 5) {
      result += " " + digits.substring(5, 10);
    }
    return result;
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    const formatted = formatPhone(digits);
    setPhone(formatted);
  };

  const profileUpdate = async (event) => {
    event.preventDefault();
    if (saving) return;

    try {
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture.");
        return;
      }

      if (phone && !/^\+91 \d{5} \d{5}$/.test(phone)) {
        toast.error("Phone number must start with +91 followed by 10 digits");
        return;
      }

      setSaving(true);
      const docRef = doc(db, "users", uid);

      const updateData = {
        bio: bio.trim(),
        name: name.trim(),
        phone: phone.trim(),
        accountType,
        showEmail,
        showPhone,
        showLastSeen,
        showBio,
        showBusinessInfo,
        ...(accountType === "business" && {
          companyName: companyName.trim(),
          industry: industry.trim(),
          website: website.trim(),
          address: address.trim(),
        }),
      };

      if (image) {
        const imgUrl = await uploadToCloudinary(image);
        setPrevImage(imgUrl);
        updateData.avatar = imgUrl;
      }

      await updateDoc(docRef, updateData);

      const snap = await getDoc(docRef);
      if (setUserData) {
        setUserData(snap.data());
      }
      toast.success("Profile & Privacy settings updated successfully!");
      navigate("/chat");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const d = docSnap.data() || {};
        if (d.name) setName(d.name);
        if (d.bio) setBio(d.bio);
        if (d.username) setUsername(d.username);
        if (d.phone) setPhone(formatPhone(d.phone.replace(/\D/g, "")));
        if (d.avatar) setPrevImage(d.avatar);
        if (d.accountType) setAccountType(d.accountType);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.industry) setIndustry(d.industry);
        if (d.website) setWebsite(d.website);
        if (d.address) setAddress(d.address);

        // Load privacy toggles
        if (d.showEmail !== undefined) setShowEmail(d.showEmail);
        if (d.showPhone !== undefined) setShowPhone(d.showPhone);
        if (d.showLastSeen !== undefined) setShowLastSeen(d.showLastSeen);
        if (d.showBio !== undefined) setShowBio(d.showBio);
        if (d.showBusinessInfo !== undefined) setShowBusinessInfo(d.showBusinessInfo);
      } else {
        navigate("/");
      }
    });
    return () => unsub();
  }, [navigate]);

  return (
    <div className="profile-page">
      {/* Ambient background glowing orbs */}
      <div className="profile-blob profile-blob-1"></div>
      <div className="profile-blob profile-blob-2"></div>

      <div className="profile-main-wrapper">
        {/* Top Back Navigation Bar */}
        <div className="profile-top-bar">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate("/chat")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Back to Chats</span>
          </button>
          <div className="profile-page-title">Edit Your Profile & Privacy</div>
        </div>

        <div className="profile-card">
          {/* Left Panel: Profile Avatar & Live Preview */}
          <div className="profile-preview-panel">
            <div className="profile-avatar-uploader">
              <div className="profile-avatar-ring">
                <img
                  className="profile-avatar-img"
                  src={
                    image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon
                  }
                  alt="Avatar Preview"
                />
                <label htmlFor="avatar-file-input" className="avatar-upload-badge" title="Change profile picture">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </label>
              </div>

              <input
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                type="file"
                id="avatar-file-input"
                accept=".png, .jpg, .jpeg, .webp, .mp4"
                hidden
              />
            </div>

            <div className="preview-info-box">
              <h3 className="preview-name">{name || "Your Name"}</h3>
              <p className="preview-username">@{username || "username"}</p>
              
              <div className="preview-badge-row">
                <span className={`preview-badge ${accountType === "business" ? "business" : "personal"}`}>
                  {accountType === "business" ? "🏢 Business" : "👤 Personal"}
                </span>
                <span className="preview-online-pill">
                  <span className="dot"></span> {showLastSeen ? "Online" : "Private"}
                </span>
              </div>

              {bio && showBio && (
                <div className="preview-bio-quote">
                  <p>“{bio}”</p>
                </div>
              )}
            </div>

            <label htmlFor="avatar-file-input" className="upload-cta-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{image || prevImage ? "Change Picture" : "Upload Picture"}</span>
            </label>
          </div>

          {/* Right Panel: Settings Form */}
          <form className="profile-form" onSubmit={profileUpdate}>
            <div className="form-header">
              <h2>Account Information</h2>
              <p>Update your personal info, account category, and privacy controls.</p>
            </div>

            {/* Account Type Selector */}
            <div className="form-field-group">
              <label className="field-label">Account Category</label>
              <div className="profile-account-grid">
                <div
                  className={`account-tile ${accountType === "personal" ? "selected" : ""}`}
                  onClick={() => setAccountType("personal")}
                >
                  <div className="tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="tile-content">
                    <span className="tile-title">Personal</span>
                    <span className="tile-desc">For friends & family</span>
                  </div>
                  <div className="tile-radio"></div>
                </div>

                <div
                  className={`account-tile ${accountType === "business" ? "selected" : ""}`}
                  onClick={() => setAccountType("business")}
                >
                  <div className="tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                      <path d="M9 22v-4h6v4"/>
                      <path d="M8 6h.01"/>
                      <path d="M16 6h.01"/>
                      <path d="M12 6h.01"/>
                    </svg>
                  </div>
                  <div className="tile-content">
                    <span className="tile-title">Business</span>
                    <span className="tile-desc">For teams & orgs</span>
                  </div>
                  <div className="tile-radio"></div>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="form-field-group">
              <label className="field-label" htmlFor="name-input">Full Name / Display Name</label>
              <div className="profile-input-wrap">
                <span className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="name-input"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  className="profile-text-input"
                  required
                />
              </div>
            </div>

            {/* Username (Read Only) */}
            <div className="form-field-group">
              <label className="field-label" htmlFor="username-display">Username (Immutable)</label>
              <div className="profile-input-wrap readonly">
                <span className="field-icon">@</span>
                <input
                  id="username-display"
                  value={username}
                  type="text"
                  placeholder="Username"
                  readOnly
                  className="profile-text-input readonly"
                />
              </div>
            </div>

            {/* Business Information Fields */}
            {accountType === "business" && (
              <div className="business-details-box">
                <h4 className="business-box-title">🏢 Business Information</h4>
                
                <div className="form-field-group">
                  <label className="field-label" htmlFor="company-name-input">Company Name</label>
                  <div className="profile-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                    </span>
                    <input
                      id="company-name-input"
                      onChange={(e) => setCompanyName(e.target.value)}
                      value={companyName}
                      type="text"
                      placeholder="Acme Corp"
                      className="profile-text-input"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-label" htmlFor="industry-input">Industry</label>
                  <div className="profile-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </span>
                    <input
                      id="industry-input"
                      onChange={(e) => setIndustry(e.target.value)}
                      value={industry}
                      type="text"
                      placeholder="e.g. Technology, Healthcare, E-commerce"
                      className="profile-text-input"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-label" htmlFor="website-input">Website</label>
                  <div className="profile-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    </span>
                    <input
                      id="website-input"
                      onChange={(e) => setWebsite(e.target.value)}
                      value={website}
                      type="url"
                      placeholder="https://example.com"
                      className="profile-text-input"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-label" htmlFor="address-input">Business Address</label>
                  <div className="profile-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </span>
                    <input
                      id="address-input"
                      onChange={(e) => setAddress(e.target.value)}
                      value={address}
                      type="text"
                      placeholder="City, State, Country"
                      className="profile-text-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="form-field-group">
              <label className="field-label" htmlFor="bio-input">About / Status Bio</label>
              <div className="profile-input-wrap textarea-wrap">
                <textarea
                  id="bio-input"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Tell others a little about yourself..."
                  className="profile-textarea"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-field-group">
              <label className="field-label" htmlFor="phone-input">Phone Number</label>
              <div className="profile-input-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <input
                  id="phone-input"
                  onChange={handlePhoneChange}
                  value={phone}
                  type="tel"
                  placeholder="+91 99999 99999"
                  maxLength={14}
                  className="profile-text-input"
                />
              </div>
            </div>

            {/* ===== PRIVACY & SECURITY CONTROLS ===== */}
            <div className="privacy-settings-box">
              <div className="privacy-box-header">
                <div className="privacy-header-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <h4>Privacy & Security Controls</h4>
                </div>
                <p className="privacy-header-sub">Configure what details are visible to other users when they view your profile.</p>
              </div>

              <div className="privacy-toggles-list">
                <div className="privacy-toggle-item">
                  <div className="toggle-text-col">
                    <span className="toggle-title">Show Email to Contacts</span>
                    <span className="toggle-desc">Allow other users to see your registered email on your contact card</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showEmail}
                      onChange={(e) => setShowEmail(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-toggle-item">
                  <div className="toggle-text-col">
                    <span className="toggle-title">Show Phone Number</span>
                    <span className="toggle-desc">Display your phone number on your public profile card</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showPhone}
                      onChange={(e) => setShowPhone(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-toggle-item">
                  <div className="toggle-text-col">
                    <span className="toggle-title">Show Online Status & Last Seen</span>
                    <span className="toggle-desc">Let contacts know when you are active now on MOCOSN CHAT</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showLastSeen}
                      onChange={(e) => setShowLastSeen(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="privacy-toggle-item">
                  <div className="toggle-text-col">
                    <span className="toggle-title">Show Status Bio</span>
                    <span className="toggle-desc">Display your about text quote on your contact profile</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showBio}
                      onChange={(e) => setShowBio(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {accountType === "business" && (
                  <div className="privacy-toggle-item">
                    <div className="toggle-text-col">
                      <span className="toggle-title">Show Business Organization Details</span>
                      <span className="toggle-desc">Display company address, website, and industry publicly</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={showBusinessInfo}
                        onChange={(e) => setShowBusinessInfo(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/chat")}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? (
                  <span className="btn-loader">
                    <span className="spinner"></span>
                    <span>Saving Changes...</span>
                  </span>
                ) : (
                  <span className="btn-content">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    <span>Save Profile Changes</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
