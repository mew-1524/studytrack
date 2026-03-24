// dashboard.js – loads stats and pending tasks for the dashboard

auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uid = user.uid;

  // ── MARKS: count subjects & avg score ──────────────
  db.collection('users').doc(uid).collection('marks').get().then(snap => {
    const subjects = new Set();
    let totalPct = 0;
    snap.forEach(doc => {
      const d = doc.data();
      subjects.add(d.subject);
      if (d.total > 0) totalPct += (d.obtained / d.total) * 100;
    });
    document.getElementById('totalSubjects').textContent = subjects.size;
    const avg = snap.size > 0 ? (totalPct / snap.size).toFixed(1) : 0;
    document.getElementById('avgScore').textContent = avg + '%';
  });

  // ── FOCUS MINUTES ───────────────────────────────────
  db.collection('users').doc(uid).collection('focus').get().then(snap => {
    let total = 0;
    snap.forEach(doc => { total += doc.data().minutes || 0; });
    document.getElementById('focusMinutes').textContent = total;
  });

  // ── TASKS: pending count + list ─────────────────────
  db.collection('users').doc(uid).collection('tasks')
    .where('done', '==', false)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snap => {
      document.getElementById('pendingTasks').textContent = snap.size;
      const list = document.getElementById('pendingTaskList');
      if (snap.empty) {
        list.innerHTML = '<li class="empty-state">🎉 No pending tasks!</li>';
        return;
      }
      list.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${d.title}</span>
          <span class="badge badge-${d.priority}">${d.priority}</span>
        `;
        list.appendChild(li);
      });
    })
    .catch(() => {
      // If index not yet built, show basic count
      db.collection('users').doc(uid).collection('tasks').get().then(snap => {
        let pending = 0;
        snap.forEach(doc => { if (!doc.data().done) pending++; });
        document.getElementById('pendingTasks').textContent = pending;
      });
    });
});
