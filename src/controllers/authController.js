const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { generateToken } = require('../config/jwt');

class AuthController {
  static async register(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(query, [username, hashedPassword], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        const token = generateToken(this.lastID);
        res.status(201).json({ userId: this.lastID, token });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      res.json({ userId: user.id, token });
    });
  }
}

module.exports = AuthController;
