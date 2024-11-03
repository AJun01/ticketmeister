import express from 'express';
import session from 'express-session';
import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import venuesRouter from './routes/venues.js';
import cartRouter from './routes/cart.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ['en', 'it', 'fr', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
});

app.use(i18n.init);

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false, 
  })
);
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', usersRouter);
app.use('/venues', venuesRouter);
app.use('/cart', cartRouter);

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});