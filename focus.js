// focus.js – Pomodoro timer with Firestore logging

let currentUser = null;
let timerInterval = null;
let timeLeft = 25 * 60;
let currentMinutes = 25;
let isRunning = false;
let sessionCount = 1;
let currentMode = 'Focus';

auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  loadFocusLog();
});

function setMode(minutes, _break, label, btn) {
  if (isRunning) return;
  currentMinutes = minutes;
  currentMode = label;
  timeLeft = minutes * 60;
  document.getElementById('timerLabel').textContent = label + ' Session';
  updateDisplay();
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function startTimer() {
  if (isRunning) {
    // Pause
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('startBtn').textContent = '▶ Resume';
    return;
  }
  isRunning = true;
  document.getElementById('startBtn').textContent = '⏸ Pause';

  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      document.getElementById('startBtn').textContent = '▶ Start';

      if (currentMode === 'Focus') {
        saveFocusSession(currentMinutes);
        sessionCount = sessionCount < 4 ? sessionCount + 1 : 1;
        document.getElementById('sessionCount').textContent = sessionCount;
        alert(`✅ Focus session complete! You focused for ${currentMinutes} minutes.`);
      } else {
        alert('Break time over! Ready for the next session?');
      }

      timeLeft = currentMinutes * 60;
      updateDisplay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft = currentMinutes * 60;
  document.getElementById('startBtn').textContent = '▶ Start';
  updateDisplay();
}

function updateDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
}

function saveFocusSession(minutes) {
  if (!currentUser) return;
  const today = new Date().toISOString().split('T')[0];
  db.collection('users').doc(currentUser.uid).collection('focus').add({
    minutes, date: today,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(loadFocusLog);
}

function loadFocusLog() {
  const today = new Date().toISOString().split('T')[0];
  db.collection('users').doc(currentUser.uid).collection('focus')
    .where('date', '==', today)
    .orderBy('timestamp', 'desc')
    .get()
    .then(snap => {
      const log = document.getElementById('focusLog');
      let total = 0;
      if (snap.empty) {
        log.innerHTML = '<li class="empty-state">No sessions completed today.</li>';
        document.getElementById('totalFocusMin').textContent = 0;
        return;
      }
      log.innerHTML = '';
      let count = 1;
      snap.forEach(doc => {
        const d = doc.data();
        total += d.minutes;
        const li = document.createElement('li');
        li.innerHTML = `<span>Session ${count++} — ${d.minutes} min</span><span style="color:#9ca3af;font-size:12px">${d.date}</span>`;
        log.appendChild(li);
      });
      document.getElementById('totalFocusMin').textContent = total;
    })
    .catch(() => {
      // Fallback without filtering
      db.collection('users').doc(currentUser.uid).collection('focus').get().then(snap => {
        let total = 0;
        snap.forEach(doc => { total += doc.data().minutes || 0; });
        document.getElementById('totalFocusMin').textContent = total;
      });
    });
}
