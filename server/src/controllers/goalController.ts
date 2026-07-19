import { Request, Response } from 'express';
import { pool } from '../db';

const DEV_USER_ID = process.env.DEV_USER_ID;

export async function getGoals(req: Request, res: Response) {
  const result = await pool.query(
    'SELECT * FROM daily_goals WHERE user_id = $1',
    [DEV_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'No goals set yet' });
  }

  res.json(result.rows[0]);
}

export async function upsertGoals(req: Request, res: Response) {
  const { calories, protein, carbs, fat, fibre } = req.body;

  if (
    typeof calories !== 'number' ||
    typeof protein !== 'number' ||
    typeof carbs !== 'number' ||
    typeof fat !== 'number' ||
    typeof fibre !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid goal data' });
  }

  const result = await pool.query(
    `INSERT INTO daily_goals (user_id, calories, protein, carbs, fat, fibre)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id)
     DO UPDATE SET calories = $2, protein = $3, carbs = $4, fat = $5, fibre = $6
     RETURNING *`,
    [DEV_USER_ID, calories, protein, carbs, fat, fibre]
  );

  res.json(result.rows[0]);
}