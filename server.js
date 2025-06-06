const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to load tasks
function loadTasks() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

// Helper to save tasks
function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// HTML Page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Task Manager API</title></head>
      <body style="font-family:sans-serif;text-align:center;padding-top:50px">
        <h1>✅ Task Manager API is running</h1>
        <p>Use /api/tasks to interact with the API.</p>
      </body>
    </html>
  `);
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  res.json(tasks);
});

// POST new task
app.post('/api/tasks', (req, res) => {
  const tasks = loadTasks();
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const newTask = {
    id: Date.now().toString(),
    title,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

// PUT mark task as completed
app.put('/api/tasks/:id', (req, res) => {
  const tasks = loadTasks();
  const taskId = req.params.id;

  const task = tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.completed = true;
  saveTasks(tasks);
  res.json(task);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  let tasks = loadTasks();
  const taskId = req.params.id;

  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);

  if (tasks.length === initialLength) return res.status(404).json({ error: 'Task not found' });

  saveTasks(tasks);
  res.json({ message: 'Task deleted' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Task Manager API running at http://localhost:${PORT}`);
});
