import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import {sendToken} from "./chatApi";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 권한 요청 + 토큰 발급
export async function requestPermissionAndGetToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ 알림 권한 거부됨");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      const result = await sendToken(token);
      console.log(result);
    }
    return token;

  } catch (err) {
    console.error("토큰 발급 실패:", err);
    return null;
  }
}