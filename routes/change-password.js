import { promises as fs } from 'fs';

// ... existing code ...

// Helper function to read users data (reuse from auth.js or refactor into a utility module)
async function readUsersData() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    } else {
      throw error;
    }
  }
}

// Helper function to write users data
async function writeUsersData(users) {
  await fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2));
}

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = await readUsersData();

  const user = users.find(u => u.id === req.session.user.id);

  if (!user) {
    // User not found
    return res.redirect('/users/account');
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatch) {
    // Password doesn't match
    // Optionally, set an error message to display
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