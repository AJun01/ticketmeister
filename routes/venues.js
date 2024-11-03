// routes/venues.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read venues data
async function readVenuesData() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/venues.json'), 'utf8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading venues.json:', error);
    throw error;
  }
}

// Venues Route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const venues = await readVenuesData();
    res.render('venues', { venues });
    // 'user' is available via res.locals.user
  } catch (error) {
    console.error('Error rendering venues:', error);
    res.status(500).send('Server Error');
  }
});

export default router;