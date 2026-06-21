import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken as fcmDeleteToken} from "firebase/messaging";
import {sendToken, deleteToken} from "./chatApi";

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
export async function enableNotification() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await sendToken(token);
      return true;
    }

  } catch (err) {
    console.error("토큰 발급 실패:", err);
    return null;
  }
}

//알림 끄기 - 현재 토큰 db 삭제 및 브라우저 토큰 폐기 
export async function disableNotification() {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await deleteToken(token); //db 삭제
      await fcmDeleteToken(messaging); //브라우저의 fcm 토큰 자체를 폐기
    }
    return true;
  } catch (err) {
    console.error("알림 해제 실패:", err);
    return false;
  }
}