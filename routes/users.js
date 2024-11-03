// routes/users.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt'; // Assuming you need this for password change
import { promises as fs } from 'fs'; // For reading and writing user data

const router = express.Router();

// __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads/'),
  filename: (req, file, cb) => {
    cb(null, req.session.user.id + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) next();
  else res.redirect('/login');
};

// Helper functions for user data (consider refactoring to a separate module)
async function readUsersData() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    } else {
      throw error;
    }
  }
}

async function writeUsersData(users) {
  await fs.writeFile(
    path.join(__dirname, '../data/users.json'),
    JSON.stringify(users, null, 2),
    'utf8'
  );
}

// Redirect '/users' to '/users/account'
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/users/account');
});

// User account view
router.get('/account', isAuthenticated, (req, res) => {
  res.render('user', { user: req.session.user });
});

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = await readUsersData();

  const user = users.find((u) => u.id === req.session.user.id);

  if (!user) {
    // Handle user not found
    return res.redirect('/users/account');
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    // Handle incorrect current password (add error handling)
    return res.redirect('/users/account');
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update user's password
  user.password = hashedNewPassword;

  // Save updated users data
  await writeUsersData(users);

  // Update session user
  req.session.user = user;

  res.redirect('/users/account');
});

// Add a picture
router.post(
  '/add-picture',
  isAuthenticated,
  upload.single('profilePicture'),
  async (req, res) => {
    if (!req.file) {
      // Handle no file uploaded
      return res.redirect('/users/account');
    }

    const users = await readUsersData();
    const user = users.find((u) => u.id === req.session.user.id);

    if (!user) {
      // Handle user not found
      return res.redirect('/users/account');
    }

    // Update user's profile picture path
    user.profilePicture = '/uploads/' + req.file.filename;

    // Save updated users data
    await writeUsersData(users);

    // Update session user
    req.session.user = user;

    res.redirect('/users/account');
  }
);

// Select default language
router.post('/select-language', isAuthenticated, async (req, res) => {
  const { language } = req.body;
  const users = await readUsersData();
  const user = users.find((u) => u.id === req.session.user.id);

  if (!user) {
    // Handle user not found
    return res.redirect('/users/account');
  }

  // Update user's language preference
  user.language = language;

  // Save updated users data
  await writeUsersData(users);

  // Update session user
  req.session.user = user;

  res.cookie('lang', language);
  req.setLocale(language);

  res.redirect('/users/account');
});

export default router;