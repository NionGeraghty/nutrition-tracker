import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Food } from '../types';
import { pool } from '../db';

const foods: Food[] = [
  {
    id: '1',
    name: 'Chicken breast',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fibrePer100g: 0,
  },
];

export async function getAllFoods(req: Request, res: Response) {
  const result = await pool.query('SELECT * FROM foods');
  res.json(result.rows);
}

export async function getFoodById(req: Request, res: Response) {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM foods WHERE id = $1', [id]);

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

  const result = await pool.query(
    `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g]
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

  const result = await pool.query(
    `UPDATE foods
     SET name = $1, calories_per_100g = $2, protein_per_100g = $3, carbs_per_100g = $4, fat_per_100g = $5, fibre_per_100g = $6
     WHERE id = $7
     RETURNING *`,
    [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, id]
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

  const result = await pool.query('DELETE FROM foods WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.status(204).send();
}