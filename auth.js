// ── AUTH HELPERS ─────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning 🌤";
  if (h < 17) return "Good Afternoon ☀️";
  if (h < 20) return "Good Evening 🌆";
  return "Good Night 🌙";
}

// ── AUTH STATE OBSERVER ─────────────────────────────────────
auth.onAuthStateChanged(user => {
  const path = window.location.pathname;
  const isAuthPage = path.endsWith('index.html') || path.endsWith('/') || path === '';

  if (user) {
    if (isAuthPage) {
      window.location.href = "dashboard.html";
      return;
    }
    const name = user.displayName || user.email.split('@')[0];
    const initial = name.charAt(0).toUpperCase();

    const nameEl   = document.getElementById('sidebarName');
    const avatarEl = document.getElementById('sidebarAvatar');
    const userNameEl = document.getElementById('userName');
    const greetEl  = document.getElementById('greetingText');

    if (nameEl)     nameEl.textContent    = name;
    if (avatarEl)   avatarEl.textContent  = initial;
    if (userNameEl) userNameEl.textContent = name;
    if (greetEl)    greetEl.textContent   = getGreeting();

  } else {
    if (!isAuthPage) {
      window.location.href = "index.html";
    }
  }
});

// ── LOGIN ────────────────────────────────────────────────────
function loginUser() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.textContent = '';

  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => { errEl.textContent = friendlyError(err.code); });
}

// ── SIGN UP ──────────────────────────────────────────────────
function signupUser() {
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errEl    = document.getElementById('signupError');
  errEl.textContent = '';

  if (!name || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => cred.user.updateProfile({ displayName: name }))
    .then(() => window.location.href = "dashboard.html")
    .catch(err => { errEl.textContent = friendlyError(err.code); });
}

// ── GOOGLE LOGIN ─────────────────────────────────────────────
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => console.error(err));
}

// ── LOGOUT ───────────────────────────────────────────────────
function logoutUser() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// ── TOGGLE FORM ──────────────────────────────────────────────
function toggleForm() {
  const login  = document.getElementById('loginForm');
  const signup = document.getElementById('signupForm');
  if (login.style.display === 'none') {
    login.style.display  = 'block';
    signup.style.display = 'none';
  } else {
    login.style.display  = 'none';
    signup.style.display = 'block';
  }
}

// ── ERROR MESSAGES ───────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/user-not-found':     'No account found with this email.',
    'auth/wrong-password':     'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email':      'Invalid email address.',
    'auth/too-many-requests':  'Too many attempts. Try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── SIDEBAR TOGGLE (mobile) ──────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
