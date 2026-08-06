import { initializeApp, getApps, getApp } from "firebase/app";

import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import E2EE from "../lib/e2ee";

const firebaseConfig = {
  apiKey: "AIzaSyC57OazOqcOQWP4aIjUmhV3pmJl2aUyINE",
  authDomain: "chatnova-gs-ab31a.firebaseapp.com",
  projectId: "chatnova-gs-ab31a",
  storageBucket: "chatnova-gs-ab31a.appspot.com",
  messagingSenderId: "91924224066",
  appId: "1:91924224066:web:e21cddf4ebd1ab3eebb5db",
};

// prevent duplicate init
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const db = getFirestore(app);

const signup = async (username, email, password, accountType = "personal", businessInfo = {}) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    const publicKey = await E2EE.getPublicKeyBase64();

    const userData = {
      id: user.uid,
      username: username.toLowerCase().trim(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using MocoChat",
      lastSeen: Date.now(),
      publicKey,
      accountType,
      ...(accountType === "business" && {
        companyName: businessInfo.companyName || "",
        industry: businessInfo.industry || "",
        website: businessInfo.website || "",
        address: businessInfo.address || "",
        phone: businessInfo.phone || "",
        businessHours: businessInfo.businessHours || "",
        verified: false,
      }),
    };

    await setDoc(doc(db, "users", user.uid), userData);

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    if (user) {
      const publicKey = await E2EE.getPublicKeyBase64();
      await updateDoc(doc(db, "users", user.uid), { publicKey }).catch(() => {});
    }
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};
const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent");
    } else {
      toast.error("Email doesnot exists");
    }
  } catch (error) {
    toast.error(error);
  }
};

export { signup, login, logout, auth, db, resetPass };
