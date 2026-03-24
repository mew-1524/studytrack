# 📘 StudyTrack — Student Academic Progress & Focus Management System

A clean, minimal web app for tracking academic scores, managing tasks, and logging focus sessions using the Pomodoro technique.

**Built with:** HTML + CSS + JavaScript + Firebase (Auth + Firestore)

---

## 📁 Project Structure

```
student-tracker/
├── index.html              ← Login / Signup page
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── firebase-config.js  ← 🔑 Your Firebase credentials (edit this)
│   ├── auth.js             ← Login, signup, Google auth, logout
│   ├── dashboard.js        ← Dashboard stats
│   ├── marks.js            ← Add/view/delete scores
│   ├── tasks.js            ← Task management
│   ├── focus.js            ← Pomodoro timer + logging
│   └── analytics.js        ← Chart.js charts
└── pages/
    ├── dashboard.html
    ├── marks.html
    ├── tasks.html
    ├── focus.html
    └── analytics.html
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → enter name (e.g. `studytrack`) → Continue
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Under **Sign-in method**, enable:
   - ✅ **Email/Password**
   - ✅ **Google**

### Step 3 — Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select your region → **Enable**

### Step 4 — Get Your Firebase Config

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **</>** (Web)
3. Register app → copy the config object
4. Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← paste here
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5 — Add Firestore Indexes

Some queries need composite indexes. Go to **Firestore → Indexes** and add:

| Collection | Fields | Order |
|---|---|---|
| `tasks` | `done` ASC, `createdAt` DESC | — |
| `focus` | `date` ASC, `timestamp` DESC | — |

(Firebase will also auto-prompt you with a link when an index is missing — just click it.)

---

## 🌐 Deploy to GitHub Pages

### Step 1 — Create GitHub Repository
1. Go to [github.com](https://github.com) → **New repository**
2. Name it `studytrack` (or anything you like)
3. Set to **Public** → **Create repository**

### Step 2 — Push Your Code
```bash
cd student-tracker
git init
git add .
git commit -m "Initial commit - StudyTrack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/studytrack.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub → **Settings**
2. Scroll to **Pages** section
3. Under **Branch**, select `main` and folder `/root`
4. Click **Save**

Your site will be live at:
`https://YOUR_USERNAME.github.io/studytrack/`

### Step 4 — Add GitHub Pages URL to Firebase Auth
1. Firebase Console → **Authentication** → **Settings**
2. Under **Authorized domains** → **Add domain**
3. Add: `YOUR_USERNAME.github.io`

---

## ✅ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Email/password + Google Sign-In |
| 📝 Marks | Add subject scores, view % and average |
| ✅ Tasks | Add tasks with priority and due date |
| ⏱ Focus Timer | Pomodoro sessions logged to Firestore |
| 📊 Analytics | Bar, line, and doughnut charts |
| 📱 Responsive | Works on mobile and desktop |

---

## 🛡 Security Note
For production, update Firestore rules to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

Made for SE Project — Student Academic Progress & Focus Management System
