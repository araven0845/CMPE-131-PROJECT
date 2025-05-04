import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore} from "firebase/firestore";

// Web app's base configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEL6tP0Ffpv2lxayWWqD4QSlD-ewgmu4Q",
  authDomain: "workout-c57ec.firebaseapp.com",
  projectId: "workout-c57ec",
  storageBucket: "workout-c57ec.firebasestorage.app",
  messagingSenderId: "673745517649",
  appId: "1:673745517649:web:5fb30b6d2292bb69600c70"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);