import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Invalid email or password (min 8 characters)' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  const user = result.rows[0];
  req.session.userId = user.id;

  res.status(201).json({ id: user.id, email: user.email });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const result = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.userId = user.id;

  res.json({ id: user.id, email: user.email });
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.status(204).send();
  });
}

export async function me(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [
    req.session.userId,
  ]);

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  res.json(result.rows[0]);
}