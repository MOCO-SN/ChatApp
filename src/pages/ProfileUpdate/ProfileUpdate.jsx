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

      if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        toast.error("Username must be 3-20 characters, alphanumeric and underscores only");
        return;
      }

      const docRef = doc(db, "users", uid);

      if (image) {
        const imgUrl = await uploadToCloudinary(image);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name,
          phone: phone,
          username: username ? username.toLowerCase().trim() : undefined,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
          phone: phone,
          username: username ? username.toLowerCase().trim() : undefined,
        });
      }

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
            placeholder="Your name"
            required
          />

          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            placeholder="Username"
          />

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
