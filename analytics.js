// analytics.js – renders Chart.js charts from Firestore data

auth.onAuthStateChanged(async user => {
  if (!user) return;
  const uid = user.uid;

  // ── SUBJECT SCORES CHART ─────────────────────────────
  db.collection('users').doc(uid).collection('marks').get().then(snap => {
    const subjectMap = {};
    snap.forEach(doc => {
      const d = doc.data();
      if (!subjectMap[d.subject]) subjectMap[d.subject] = { total: 0, obtained: 0 };
      subjectMap[d.subject].obtained += d.obtained;
      subjectMap[d.subject].total += d.total;
    });

    const labels = Object.keys(subjectMap);
    const data = labels.map(s => {
      const v = subjectMap[s];
      return v.total > 0 ? +((v.obtained / v.total) * 100).toFixed(1) : 0;
    });

    new Chart(document.getElementById('scoresChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Score %',
          data,
          backgroundColor: '#4f6ef7cc',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100, grid: { color: '#e8eaef' } }, x: { grid: { display: false } } }
      }
    });
  });

  // ── FOCUS LAST 7 DAYS CHART ──────────────────────────
  const last7 = [];
  const dayLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(d.toISOString().split('T')[0]);
    dayLabels.push(d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }));
  }

  db.collection('users').doc(uid).collection('focus').get().then(snap => {
    const focusMap = {};
    snap.forEach(doc => {
      const d = doc.data();
      if (!focusMap[d.date]) focusMap[d.date] = 0;
      focusMap[d.date] += d.minutes || 0;
    });

    const focusData = last7.map(date => focusMap[date] || 0);

    new Chart(document.getElementById('focusChart'), {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Minutes',
          data: focusData,
          borderColor: '#22c55e',
          backgroundColor: '#22c55e18',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#22c55e'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, grid: { color: '#e8eaef' } }, x: { grid: { display: false } } }
      }
    });
  });

  // ── TASK COMPLETION PIE CHART ────────────────────────
  db.collection('users').doc(uid).collection('tasks').get().then(snap => {
    let done = 0, pending = 0;
    snap.forEach(doc => { doc.data().done ? done++ : pending++; });

    new Chart(document.getElementById('taskChart'), {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [done, pending],
          backgroundColor: ['#22c55e', '#f59e0b'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { family: 'DM Sans' } } }
        },
        cutout: '65%'
      }
    });
  });
});
