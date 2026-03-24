// marks.js

let currentUser = null;

auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  loadMarks();
});

function addMark() {
  const subject = document.getElementById('subject').value.trim();
  const examName = document.getElementById('examName').value.trim();
  const obtained = parseFloat(document.getElementById('obtained').value);
  const total = parseFloat(document.getElementById('total').value);
  const errEl = document.getElementById('marksError');
  errEl.textContent = '';

  if (!subject || !examName || isNaN(obtained) || isNaN(total)) {
    errEl.textContent = 'Please fill in all fields.'; return;
  }
  if (obtained > total) { errEl.textContent = 'Obtained cannot exceed total.'; return; }

  db.collection('users').doc(currentUser.uid).collection('marks').add({
    subject, examName, obtained, total,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('subject').value = '';
    document.getElementById('examName').value = '';
    document.getElementById('obtained').value = '';
    document.getElementById('total').value = '';
    loadMarks();
  });
}

function loadMarks() {
  db.collection('users').doc(currentUser.uid).collection('marks')
    .orderBy('createdAt', 'desc').get().then(snap => {
      const tbody = document.getElementById('marksTable');
      if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No scores added yet.</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const pct = d.total > 0 ? ((d.obtained / d.total) * 100).toFixed(1) : 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${d.subject}</td>
          <td>${d.examName}</td>
          <td>${d.obtained} / ${d.total}</td>
          <td><strong>${pct}%</strong></td>
          <td><button class="btn-icon" onclick="deleteMark('${doc.id}')">🗑</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function deleteMark(id) {
  if (!confirm('Delete this score?')) return;
  db.collection('users').doc(currentUser.uid).collection('marks').doc(id).delete().then(loadMarks);
}
