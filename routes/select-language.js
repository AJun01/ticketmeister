router.post('/select-language', isAuthenticated, async (req, res) => {
    const { language } = req.body;
  
    const users = await readUsersData();
    const user = users.find(u => u.id === req.session.user.id);
  
    if (!user) {
      // User not found
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