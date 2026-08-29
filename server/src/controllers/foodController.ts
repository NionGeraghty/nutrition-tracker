import { Request, Response } from 'express';
import { pool } from '../db';
import { Food } from '../types';
import { resolveAllowedTargets } from '../lib/permissions';

export async function getAllFoods(req: Request, res: Response) {
  const { forUserId } = req.query;

  let targetUserId = req.session.userId!;

  if (typeof forUserId === 'string' && forUserId !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [forUserId, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to view this account\'s foods' });
    }
    targetUserId = forUserId;
  }

  const result = await pool.query<Food>(
    'SELECT * FROM foods WHERE user_id = $1 ORDER BY LOWER(name) ASC',
    [targetUserId]
  );
  res.json(result.rows);
}

export async function getFoodById(req: Request, res: Response) {
  const { id } = req.params;

  const result = await pool.query<Food>(
    'SELECT * FROM foods WHERE id = $1 AND user_id = $2',
    [id, req.session.userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.json(result.rows[0]);
}

export async function createFood(req: Request, res: Response) {
  const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, portionGrams, targetUserIds } = req.body;

  if (
    typeof name !== 'string' ||
    typeof caloriesPer100g !== 'number' ||
    typeof proteinPer100g !== 'number' ||
    typeof carbsPer100g !== 'number' ||
    typeof fatPer100g !== 'number' ||
    typeof fibrePer100g !== 'number' ||
    (portionGrams !== undefined && portionGrams !== null && typeof portionGrams !== 'number')
  ) {
    return res.status(400).json({ error: 'Invalid food data' });
  }

  const targets = await resolveAllowedTargets(req.session.userId!, targetUserIds);
  if (targets === null) {
    return res.status(403).json({ error: 'You do not have permission to add to one or more of these accounts' });
  }

  const results = [];
  for (const userId of targets) {
    const result = await pool.query<Food>(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, portion_grams, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, portionGrams ?? null, userId]
    );
    results.push(result.rows[0]);
  }

  res.status(201).json(results);
}

export async function updateFood(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, portionGrams } = req.body;

  if (
    typeof name !== 'string' ||
    typeof caloriesPer100g !== 'number' ||
    typeof proteinPer100g !== 'number' ||
    typeof carbsPer100g !== 'number' ||
    typeof fatPer100g !== 'number' ||
    typeof fibrePer100g !== 'number' ||
    (portionGrams !== undefined && portionGrams !== null && typeof portionGrams !== 'number')
  ) {
    return res.status(400).json({ error: 'Invalid food data' });
  }

  const result = await pool.query<Food>(
    `UPDATE foods
     SET name = $1, calories_per_100g = $2, protein_per_100g = $3, carbs_per_100g = $4, fat_per_100g = $5, fibre_per_100g = $6, portion_grams = $7
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fibrePer100g, portionGrams ?? null, id, req.session.userId]
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
    [id, req.session.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Food not found' });
  }

  res.status(204).send();
}