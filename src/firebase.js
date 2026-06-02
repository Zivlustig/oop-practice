import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDwRO6WeriQpmrKVIhcwvninecBemtdwug",
  authDomain: "oop-practice-738e1.firebaseapp.com",
  projectId: "oop-practice-738e1",
  storageBucket: "oop-practice-738e1.firebasestorage.app",
  messagingSenderId: "784751551024",
  appId: "1:784751551024:web:63584417d93c9f090d03f5"
}

const app = initializeApp(firebaseConfig)
export const db  = getFirestore(app)
export const auth = getAuth(app)
export default app
