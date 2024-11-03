// routes/auth.js

import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const router = express.Router();

// __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the users data file (JSON)
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to read users data
async function readUsersData() {
    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
  
      if (data.trim() === '') {
        return [];
      }
  
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      } else if (error instanceof SyntaxError) {
        // Log the error and return empty array
        console.error('Invalid JSON in users.json:', error.message);
        return [];
      } else {
        throw error;
      }
    }
  }

// Helper function to write users data
async function writeUsersData(users) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  }

// Sign-Up Routes
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  const { username, password, language } = req.body;
  const users = await readUsersData();

  // Check if username already exists
  if (users.find((user) => user.username === username)) {
    return res.render('signup', { error: 'error_username_exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    id: Date.now(),
    username,
    password: hashedPassword,
    language,
    picture: null,
  };

  users.push(newUser);
  await writeUsersData(users);

  // Set user session
  req.session.user = newUser;
  res.cookie('lang', language); // Set language preference
  req.setLocale(language); // Set locale

  // Redirect to venues
  res.redirect('/venues');
});

// Login Routes
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await readUsersData();

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.render('login', { error: 'error_invalid_credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.render('login', { error: 'error_invalid_credentials' });
  }

  // Set user session
  req.session.user = user;
  res.cookie('lang', user.language); // Set language preference
  req.setLocale(user.language); // Set locale

  // Redirect to venues
  res.redirect('/venues');
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('lang'); // Clear language cookie
    res.redirect('/login');
  });
});

export default router;