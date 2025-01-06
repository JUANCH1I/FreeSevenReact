// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBSl6srh8YIGsrTPhNuFUJlB7FDkS98Lik',
  authDomain: 'freeseven-fefc4.firebaseapp.com',
  projectId: 'freeseven-fefc4',
  storageBucket: 'freeseven-fefc4.firebasestorage.app',
  messagingSenderId: '603135164035',
  appId: '1:603135164035:web:b00e7fe68c74a0a4bd65b6',
  measurementId: 'G-WH06KXBZPR',
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
const db = getFirestore(app)
const storage = getStorage(app)

export { db, storage }
