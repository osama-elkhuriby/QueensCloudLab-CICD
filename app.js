const express = require('express');
const os = require('os');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
const DB_NAME = 'tasksdb';
let collection;

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = await MongoClient.connect(DB_URL);
      collection = client.db(DB_NAME).collection('tasks');
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`Attempt ${i} failed: ${err.message}`);
      if (i === retries) process.exit(1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

app.get('/', (req, res) => {
  res.json({ app: 'CISC 886 Lab 8', host: os.hostname() });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await collection.find().toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(`App running on port ${PORT}`));
});
