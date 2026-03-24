// profile.js

let currentUser = null;

auth.onAuthStateChanged(async user => {
  if (!user) return;
  currentUser = user;

  const name = user.displayName || user.email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();

  document.getElementById('profileAvatar').textContent = initial;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('newName').value = name;

  loadSummary(user.uid);
});

function loadSummary(uid) {
  // Subjects & avg
  db.collection('users').doc(uid).collection('marks').get().then(snap => {
    const subjects = new Set();
    let totalPct = 0;
    snap.forEach(doc => {
      const d = doc.data();
      subjects.add(d.subject);
      if (d.total > 0) totalPct += (d.obtained / d.total) * 100;
    });
    document.getElementById('summarySubjects').textContent = subjects.size;
    const avg = snap.size > 0 ? (totalPct / snap.size).toFixed(1) + '%' : '—';
    document.getElementById('summaryAvg').textContent = avg;
  });

  // Tasks
  db.collection('users').doc(uid).collection('tasks').get().then(snap => {
    document.getElementById('summaryTasks').textContent = snap.size;
  });

  // Focus
  db.collection('users').doc(uid).collection('focus').get().then(snap => {
    let total = 0;
    snap.forEach(doc => { total += doc.data().minutes || 0; });
    document.getElementById('summaryFocus').textContent = total;
  });
}

function updateName() {
  const name = document.getElementById('newName').value.trim();
  const msg = document.getElementById('nameMsg');
  msg.style.color = '#ef4444';
  msg.textContent = '';

  if (!name) { msg.textContent = 'Name cannot be empty.'; return; }

  currentUser.updateProfile({ displayName: name }).then(() => {
    msg.style.color = '#16a34a';
    msg.textContent = '✅ Name updated successfully!';
    document.getElementById('profileName').textContent = name;
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('sidebarAvatar').textContent = name.charAt(0).toUpperCase();
  }).catch(err => { msg.textContent = err.message; });
}

function changePassword() {
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const msg = document.getElementById('passMsg');
  msg.style.color = '#ef4444';
  msg.textContent = '';

  if (!newPass || !confirm) { msg.textContent = 'Please fill both fields.'; return; }
  if (newPass.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
  if (newPass !== confirm) { msg.textContent = 'Passwords do not match.'; return; }

  currentUser.updatePassword(newPass).then(() => {
    msg.style.color = '#16a34a';
    msg.textContent = '✅ Password updated successfully!';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }).catch(err => {
    if (err.code === 'auth/requires-recent-login') {
      msg.textContent = 'Please log out and log in again before changing your password.';
    } else {
      msg.textContent = err.message;
    }
  });
}

function deleteAccount() {
  if (!confirm('Are you sure? This will permanently delete your account and ALL data. This cannot be undone.')) return;
  if (!confirm('Last chance — are you absolutely sure?')) return;

  const uid = currentUser.uid;

  // Delete Firestore data then account
  Promise.all([
    deleteCollection(uid, 'marks'),
    deleteCollection(uid, 'tasks'),
    deleteCollection(uid, 'focus'),
  ]).then(() => currentUser.delete())
    .then(() => window.location.href = 'index.html')
    .catch(err => alert('Error: ' + err.message + '\n\nYou may need to re-login before deleting your account.'));
}

async function deleteCollection(uid, colName) {
  const snap = await db.collection('users').doc(uid).collection(colName).get();
  const batch = db.batch();
  snap.forEach(doc => batch.delete(doc.ref));
  return batch.commit();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
