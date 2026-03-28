const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read task' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const tasks = await readTasks();
    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[index] = { ...tasks[index], ...req.body, id };
    await writeTasks(tasks);

    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tasks = await readTasks();
    const filtered = tasks.filter(t => t.id !== id);

    if (filtered.length === tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await writeTasks(filtered);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});