// tasks.js

let currentUser = null;
let allTasks = [];
let currentFilter = 'all';

auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  loadTasks();
});

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const due = document.getElementById('taskDue').value;
  const errEl = document.getElementById('taskError');
  errEl.textContent = '';

  if (!title) { errEl.textContent = 'Task title is required.'; return; }

  db.collection('users').doc(currentUser.uid).collection('tasks').add({
    title, priority, due, done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDue').value = '';
    loadTasks();
  });
}

function loadTasks() {
  db.collection('users').doc(currentUser.uid).collection('tasks')
    .orderBy('createdAt', 'desc').get().then(snap => {
      allTasks = [];
      snap.forEach(doc => allTasks.push({ id: doc.id, ...doc.data() }));
      renderTasks();
    }).catch(() => {
      // Fallback without ordering if index missing
      db.collection('users').doc(currentUser.uid).collection('tasks').get().then(snap => {
        allTasks = [];
        snap.forEach(doc => allTasks.push({ id: doc.id, ...doc.data() }));
        renderTasks();
      });
    });
}

function renderTasks() {
  const list = document.getElementById('taskList');
  let filtered = allTasks;
  if (currentFilter === 'pending') filtered = allTasks.filter(t => !t.done);
  if (currentFilter === 'done') filtered = allTasks.filter(t => t.done);

  if (!filtered.length) {
    list.innerHTML = '<li class="empty-state">No tasks here.</li>';
    return;
  }

  list.innerHTML = '';
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = task.done ? 'done-task' : '';
    li.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)" style="cursor:pointer"/>
        <div>
          <span>${task.title}</span>
          ${task.due ? `<span style="font-size:11px;color:#9ca3af;margin-left:8px">Due: ${task.due}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="badge badge-${task.priority}">${task.priority}</span>
        <button class="btn-icon" onclick="deleteTask('${task.id}')">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function toggleTask(id, done) {
  db.collection('users').doc(currentUser.uid).collection('tasks').doc(id)
    .update({ done }).then(loadTasks);
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  db.collection('users').doc(currentUser.uid).collection('tasks').doc(id).delete().then(loadTasks);
}

function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}
