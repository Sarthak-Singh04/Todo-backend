const { db } = require('../config/database');

class TaskController {
  static createTask(req, res) {
    const { title, description } = req.body;
    const userId = req.userId;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const query = 'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)';
    db.run(query, [userId, title, description], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        title,
        description,
        status: 'pending'
      });
    });
  }

  static getAllTasks(req, res) {
    const userId = req.userId;
    const query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
    db.all(query, [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  }

  static getTaskById(req, res) {
    const userId = req.userId;
    const query = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    db.get(query, [req.params.id, userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(row);
    });
  }

  static updateTask(req, res) {
    const userId = req.userId;
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?';
    db.run(query, [status, req.params.id, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task updated successfully' });
    });
  }

  static deleteTask(req, res) {
    const userId = req.userId;
    const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
    db.run(query, [req.params.id, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    });
  }
}

module.exports = TaskController;
