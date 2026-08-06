import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/Firebase-temp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import uploadToCloudinary from "../../lib/cloudinary";
import { AppContext } from "../../context/AppContext";

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
    try {
      if (!prevImage && !image) {
        toast.error("Upload profile picture");
        return;
      }

      if (phone && !/^\+91 \d{5} \d{5}$/.test(phone)) {
        toast.error("Phone number must start with +91 followed by 10 digits");
        return;
      }

      const docRef = doc(db, "users", uid);

      const updateData = {
        bio: bio,
        name: name,
        phone: phone,
        accountType,
        ...(accountType === "business" && {
          companyName,
          industry,
          website,
          address,
        }),
      };

      if (image) {
        const imgUrl = await uploadToCloudinary(image);
        setPrevImage(imgUrl);
        updateData.avatar = imgUrl;
      }

      await updateDoc(docRef, updateData);

      const snap = await getDoc(docRef);
      setUserData && setUserData(snap.data());
      toast.success("Profile updated!");
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Update failed");
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
      } else {
        navigate("/");
      }
    });
    return () => unsub();
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-pre">
        <img
          className="profile-pic"
          src={
            image ? URL.createObjectURL(image) : prevImage || assets.logo_icon
          }
          alt=""
        />
        {accountType === "business" && (
          <span className="profile-account-badge">Business</span>
        )}
        </div>
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg, .webp, .mp4"
              hidden
            />
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage || assets.avatar_icon
              }
              alt=""
            />
            Upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name / Company name"
            required
          />

          <input
            value={username}
            type="text"
            placeholder="Username"
            readOnly
            style={{ opacity: 0.7, cursor: "not-allowed" }}
          />

          <div className="account-type-selector">
            <label className={`radio-label ${accountType === "personal" ? "selected" : ""}`}>
              <input
                type="radio"
                name="accountType"
                value="personal"
                checked={accountType === "personal"}
                onChange={(e) => setAccountType(e.target.value)}
              />
              <span>Personal</span>
            </label>
            <label className={`radio-label ${accountType === "business" ? "selected" : ""}`}>
              <input
                type="radio"
                name="accountType"
                value="business"
                checked={accountType === "business"}
                onChange={(e) => setAccountType(e.target.value)}
              />
              <span>Business</span>
            </label>
          </div>

          {accountType === "business" && (
            <div className="business-info-card">
              <h4>Business Information</h4>
              <input
                onChange={(e) => setCompanyName(e.target.value)}
                value={companyName}
                type="text"
                placeholder="Company Name"
                className="form-input"
              />
              <input
                onChange={(e) => setIndustry(e.target.value)}
                value={industry}
                type="text"
                placeholder="Industry"
                className="form-input"
              />
              <input
                onChange={(e) => setWebsite(e.target.value)}
                value={website}
                type="url"
                placeholder="Website"
                className="form-input"
              />
              <input
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                type="text"
                placeholder="Business Address"
                className="form-input"
              />
            </div>
          )}

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile bio"
            required
          />

          <input
            onChange={handlePhoneChange}
            value={phone}
            type="tel"
            placeholder="+91 99999 99999"
            maxLength={14}
          />

          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
