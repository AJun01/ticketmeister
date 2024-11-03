// routes/cart.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const router = express.Router();

// __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize cart middleware
router.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// View cart
router.get('/', (req, res) => {
  res.render('cart', { cart: req.session.cart });
});

// Add ticket to cart
router.get('/add/:id', async (req, res) => {
  const venueId = parseInt(req.params.id, 10);

  // Read venues data
  try {
    const data = await fs.readFile(
      path.join(__dirname, '../data/venues.json'),
      'utf8'
    );
    const venues = JSON.parse(data);
    const venue = venues.find((v) => v.id === venueId);

    if (venue) {
      // Check if item already in cart
      const itemIndex = req.session.cart.findIndex(
        (item) => item.venue.id === venueId
      );
      if (itemIndex > -1) {
        // Increase quantity
        req.session.cart[itemIndex].quantity += 1;
      } else {
        // Add new item
        req.session.cart.push({ venue, quantity: 1 });
      }
    }
    res.redirect('/cart');
  } catch (error) {
    console.error('Error reading venues.json:', error);
    res.status(500).send('Server Error');
  }
});

// Update cart
router.post('/update', (req, res) => {
  const { quantities } = req.body; // Assume quantities is an array of quantities

  if (Array.isArray(quantities)) {
    req.session.cart.forEach((item, index) => {
      item.quantity = parseInt(quantities[index], 10) || 1;
    });
  } else {
    // Single item in cart
    req.session.cart[0].quantity = parseInt(quantities, 10) || 1;
  }

  res.redirect('/cart');
});

// Remove ticket from cart
router.post('/remove/:id', (req, res) => {
  const venueId = parseInt(req.params.id, 10);
  req.session.cart = req.session.cart.filter(
    (item) => item.venue.id !== venueId
  );
  res.redirect('/cart');
});

export default router;