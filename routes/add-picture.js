router.post(
    '/add-picture',
    isAuthenticated,
    upload.single('profilePicture'),
    async (req, res) => {
      if (!req.file) {
        // No file uploaded
        return res.redirect('/users/account');
      }
  
      const users = await readUsersData();
      const user = users.find(u => u.id === req.session.user.id);
  
      if (!user) {
        // User not found
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