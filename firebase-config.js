// =============================================
//  REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG
//  Go to: Firebase Console > Project Settings > Your Apps > SDK Setup
// =============================================
const firebaseConfig = {
  apiKey: "AIzaSyDZrvfxdXjecRjj54lNRBtP9XY1np1I8QI",
  authDomain: "study-track-bf630.firebaseapp.com",
  projectId: "study-track-bf630",
  storageBucket: "study-track-bf630.firebasestorage.app",
  messagingSenderId: "694660046147",
  appId: "1:694660046147:web:caf913b4ff387db15e23f6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
