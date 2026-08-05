import express from 'express';
import foodRoutes from './routes/foodRoutes';
import entryRoutes from './routes/entryRoutes';
import goalRoutes from './routes/goalRoutes';
import summaryRoutes from './routes/summaryRoutes';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import authRoutes from './routes/authRoutes';
import './types/session';
import { requireAuth } from './middleware/requireAuth';

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Nutrition tracker API is running');
});

app.use('/foods', requireAuth, foodRoutes);
app.use('/entries', requireAuth, entryRoutes);
app.use('/goals', requireAuth, goalRoutes);
app.use('/summary', requireAuth, summaryRoutes);
app.use('/auth', authRoutes);

export default app;