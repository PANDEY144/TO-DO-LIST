/* ── AI Todo Manager — app.js ── */

// ── State ────────────────────────────────────────────────
let tasks  = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let currentTheme = localStorage.getItem('theme') || 'dark';
let aiMessages = JSON.parse(localStorage.getItem('aiMessages') || '[]');

// ── DOM Refs ─────────────────────────────────────────────
const input       = document.getElementById('task-input');
const addBtn      = document.getElementById('add-btn');
const list        = document.getElementById('task-list');
const emptyState  = document.getElementById('empty-state');
const totalEl     = document.getElementById('total-count');
const doneEl      = document.getElementById('done-count');
const leftEl      = document.getElementById('left-count');
const progressEl  = document.getElementById('progress-fill');
const dateEl      = document.getElementById('current-date');
const clearDoneBtn = document.getElementById('clear-done');
const filterBtns  = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const aiToggle = document.getElementById('ai-toggle');
const aiClose = document.getElementById('ai-close');
const aiPanel = document.getElementById('ai-panel');
const aiMessagesEl = document.getElementById('ai-messages');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const particles = document.getElementById('particles');

// ── Date ─────────────────────────────────────────────────
(function setDate() {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  }).toUpperCase();
})();

// ── Persistence ──────────────────────────────────────────
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── Create Task Object ───────────────────────────────────
function createTask(text) {
  return { id: Date.now().toString(), text: text.trim(), done: false };
}

// ── Add Task ─────────────────────────────────────────────
function addTask() {
  const text = input.value.trim();
  if (!text) {
    input.classList.add('shake');
    input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
    return;
  }
  tasks.unshift(createTask(text));
  input.value = '';
  save();
  render();
}

// ── Toggle Done ──────────────────────────────────────────
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.done = !t.done;
  save();
  render();
}

// ── Delete Task ──────────────────────────────────────────
function deleteTask(id, li) {
  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }, { once: true });
}

// ── Clear Done ───────────────────────────────────────────
function clearDone() {
  const doneItems = list.querySelectorAll('.task-item.done');
  if (!doneItems.length) return;
  let remaining = doneItems.length;
  doneItems.forEach((li, i) => {
    setTimeout(() => {
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        remaining--;
        if (remaining === 0) {
          tasks = tasks.filter(t => !t.done);
          save();
          render();
        }
      }, { once: true });
    }, i * 40);
  });
}

// ── Filtered View ────────────────────────────────────────
function filteredTasks() {
  if (filter === 'active') return tasks.filter(t => !t.done);
  if (filter === 'done')   return tasks.filter(t => t.done);
  return tasks;
}

// ── Build Task LI ────────────────────────────────────────
function buildTaskEl(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.done ? ' done' : '');
  li.dataset.id = task.id;

  const check = document.createElement('div');
  check.className = 'task-check';
  check.setAttribute('role', 'checkbox');
  check.setAttribute('aria-checked', task.done);
  check.setAttribute('tabindex', '0');
  check.innerHTML = `
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <polyline points="1,4.5 4,7.5 10,1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  check.addEventListener('click', () => toggleTask(task.id));
  check.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleTask(task.id); } });

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  const del = document.createElement('button');
  del.className = 'task-delete';
  del.setAttribute('aria-label', 'Delete task');
  del.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  del.addEventListener('click', () => deleteTask(task.id, li));

  li.appendChild(check);
  li.appendChild(span);
  li.appendChild(del);
  return li;
}

// ── Update Stats ─────────────────────────────────────────
function updateStats() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const left  = total - done;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  totalEl.textContent = total;
  doneEl.textContent  = done;
  leftEl.textContent  = left;
  progressEl.style.width = pct + '%';
}

// ── Render ───────────────────────────────────────────────
function render() {
  list.innerHTML = '';
  const visible = filteredTasks();

  if (visible.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    visible.forEach(task => list.appendChild(buildTaskEl(task)));
  }

  updateStats();
}

// ── Theme, Particles, AI Functions ───────────────────────────────────────

function toggleTheme() {
  const themes = ['dark', 'light'];
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem('theme', currentTheme);
}

function createParticles() {
  particles.innerHTML = '';
  let count = 0;
  const spawnParticle = () => {
    if (count < 40) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      p.style.animationDelay = Math.random() * 5 + 's';
      particles.appendChild(p);
      count++;
    }
    setTimeout(spawnParticle, Math.random() * 2000 + 1000);
  };
  spawnParticle();
}

function renderAIMessages() {
  aiMessagesEl.innerHTML = aiMessages.map(m => '<div class="ai-message ' + m.role + '">' + m.text.replace(/\\n/g, '<br>') + '</div>').join('');
  aiMessagesEl.scrollTop = aiMessagesEl.scrollHeight;
  localStorage.setItem('aiMessages', JSON.stringify(aiMessages.slice(-50)));
}

async function callGemini(prompt) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        tasks: tasks.slice(0, 10)
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data.error || 'Unknown AI API error';
      console.error('AI API error:', data);
      return 'AI API error: ' + message;
    }
    if (data.text) {
      return data.text;
    }
  } catch (e) {
    console.error('AI error:', e);
    return 'Network error while calling AI backend: ' + e.message;
  }
  return 'AI backend returned no text. Please check the browser console for details.';
}

async function sendAIMessage() {
  const text = aiInput.value.trim();
  if (!text) return;
  aiMessages.push({role: 'user', text});
  renderAIMessages();
  aiInput.value = '';
  const spinner = document.createElement('div');
  spinner.className = 'ai-message ai';
  spinner.textContent = 'AI thinking...';
  aiMessagesEl.appendChild(spinner);
  aiMessagesEl.scrollTop = aiMessagesEl.scrollHeight;
  const response = await callGemini(text);
  aiMessagesEl.removeChild(spinner);
  aiMessages.push({role: 'ai', text: response});
  renderAIMessages();
}

// ── Filter Buttons ───────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});

// ── Event Listeners ──────────────────────────────────────
addBtn.addEventListener('click', addTask);
clearDoneBtn.addEventListener('click', clearDone);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Theme
themeToggle.addEventListener('click', toggleTheme);

// AI Chat
aiToggle.addEventListener('click', () => aiPanel.classList.toggle('open'));
aiClose.addEventListener('click', () => aiPanel.classList.remove('open'));
aiSend.addEventListener('click', sendAIMessage);
aiInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIMessage();
  }
});

function init() {
  document.documentElement.dataset.theme = currentTheme;
  localStorage.removeItem('geminiApiKey');
  renderAIMessages();
  createParticles();
  render();
}

init();
