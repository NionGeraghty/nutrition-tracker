import { Request, Response } from 'express';
import { pool } from '../db';
import { Food } from '../types';

const DEV_USER_ID = process.env.DEV_USER_ID;

export async function getAllFoods(req: Request, res: Response) {
  const result = await pool.query<Food>('SELECT * FROM foods WHERE user_id = $1', [DEV_USER_ID]);
  res.json(result.rows);
}

export async function getFoodById(req: Request, res: Response) {
  const { id } = req.params;

  const result = await pool.query<Food>(
    'SELECT * FROM foods WHERE id = $1 AND user_id = $2',
    [id, DEV_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.json(result.rows[0]);
}

export async function createFood(req: Request, res: Response) {
  const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g } = req.body;

  if (
    typeof name !== 'string' ||
    typeof caloriesPer100g !== 'number' ||
    typeof proteinPer100g !== 'number' ||
    typeof carbsPer100g !== 'number' ||
    typeof fatPer100g !== 'number' ||
    typeof fibrePer100g !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid food data' });
  }

  const result = await pool.query<Food>(
    `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, DEV_USER_ID]
  );

  res.status(201).json(result.rows[0]);
}

export async function updateFood(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g } = req.body;

  if (
    typeof name !== 'string' ||
    typeof caloriesPer100g !== 'number' ||
    typeof proteinPer100g !== 'number' ||
    typeof carbsPer100g !== 'number' ||
    typeof fatPer100g !== 'number' ||
    typeof fibrePer100g !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid food data' });
  }

  const result = await pool.query<Food>(
    `UPDATE foods
     SET name = $1, calories_per_100g = $2, protein_per_100g = $3, carbs_per_100g = $4, fat_per_100g = $5, fibre_per_100g = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, id, DEV_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.json(result.rows[0]);
}

export async function deleteFood(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const result = await pool.query(
    'DELETE FROM foods WHERE id = $1 AND user_id = $2',
    [id, DEV_USER_ID]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.status(204).send();
}