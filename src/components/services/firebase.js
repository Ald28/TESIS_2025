import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC5xbjcZx6KJhAodLMyiI1151W-HEe0gRg",
  authDomain: "notificaciones-9605c.firebaseapp.com",
  projectId: "notificaciones-9605c",
  storageBucket: "notificaciones-9605c.firebasestorage.app",
  messagingSenderId: "1024686886650",
  appId: "1:1024686886650:web:74f1b57df7c98a13e50343",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken };