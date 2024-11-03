// routes/index.js

import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/signup');
});

export default router;
