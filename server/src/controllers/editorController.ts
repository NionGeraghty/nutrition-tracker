import { Request, Response } from 'express';
import { pool } from '../db';

export async function addEditor(req: Request, res: Response) {
  const { email } = req.body;

  if (typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'No account found with that email' });
  }

  const editorId = userResult.rows[0].id;

  if (editorId === req.session.userId) {
    return res.status(400).json({ error: 'You cannot add yourself' });
  }

  const existing = await pool.query(
    'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
    [req.session.userId, editorId]
  );
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'This person already has editing access' });
  }

  const result = await pool.query(
    'INSERT INTO editor_permissions (owner_id, editor_id) VALUES ($1, $2) RETURNING *',
    [req.session.userId, editorId]
  );

  res.status(201).json(result.rows[0]);
}

export async function removeEditor(req: Request, res: Response) {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM editor_permissions WHERE id = $1 AND owner_id = $2',
    [id, req.session.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Permission not found' });
  }

  res.status(204).send();
}

export async function getMyEditors(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT editor_permissions.id, users.email
     FROM editor_permissions
     JOIN users ON editor_permissions.editor_id = users.id
     WHERE editor_permissions.owner_id = $1`,
    [req.session.userId]
  );
  res.json(result.rows);
}

export async function getWhoGaveMeAccess(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT editor_permissions.id, users.email, users.id AS owner_id
     FROM editor_permissions
     JOIN users ON editor_permissions.owner_id = users.id
     WHERE editor_permissions.editor_id = $1`,
    [req.session.userId]
  );
  res.json(result.rows);
}

export async function getUnreciprocated(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT users.id, users.email
     FROM editor_permissions
     JOIN users ON editor_permissions.owner_id = users.id
     WHERE editor_permissions.editor_id = $1
     AND NOT EXISTS (
       SELECT 1 FROM editor_permissions ep2
       WHERE ep2.owner_id = $1 AND ep2.editor_id = editor_permissions.owner_id
     )`,
    [req.session.userId]
  );
  res.json(result.rows);
}