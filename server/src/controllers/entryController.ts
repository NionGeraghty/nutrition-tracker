import { Request, Response } from 'express';
import { pool } from '../db';
import { FoodEntry } from '../types';

const DEV_USER_ID = process.env.DEV_USER_ID;

export async function createEntry(req: Request, res: Response) {
  const { foodId, date, grams, mealType } = req.body;

  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  if (
    typeof foodId !== 'string' ||
    typeof date !== 'string' ||
    typeof grams !== 'number' ||
    typeof mealType !== 'string' ||
    !validMealTypes.includes(mealType)
  ) {
    return res.status(400).json({ error: 'Invalid entry data' });
  }

  const foodCheck = await pool.query(
    'SELECT id FROM foods WHERE id = $1 AND user_id = $2',
    [foodId, DEV_USER_ID]
  );
  if (foodCheck.rows.length === 0) {
    return res.status(400).json({ error: 'No food exists with that id' });
  }

  const result = await pool.query<FoodEntry>(
    `INSERT INTO food_entries (food_id, date, grams, meal_type, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [foodId, date, grams, mealType, DEV_USER_ID]
  );

  res.status(201).json(result.rows[0]);
}

export async function getEntriesByDate(req: Request, res: Response) {
  const { date } = req.query;

  if (typeof date !== 'string') {
    return res.status(400).json({ error: 'A date query parameter is required' });
  }

  const result = await pool.query(
  `SELECT
     food_entries.id,
     food_entries.date,
     food_entries.grams,
     food_entries.meal_type,
     foods.name,
     foods.calories_per_100g,
     foods.protein_per_100g,
     foods.carbs_per_100g,
     foods.fat_per_100g,
     foods.fibre_per_100g
   FROM food_entries
   JOIN foods ON food_entries.food_id = foods.id
   WHERE food_entries.date = $1 AND food_entries.user_id = $2`,
  [date, DEV_USER_ID]
);

  res.json(result.rows);
}

export async function updateEntry(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { foodId, date, grams, mealType } = req.body;

  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  if (
    typeof foodId !== 'string' ||
    typeof date !== 'string' ||
    typeof grams !== 'number' ||
    typeof mealType !== 'string' ||
    !validMealTypes.includes(mealType)
  ) {
    return res.status(400).json({ error: 'Invalid entry data' });
  }

  const foodCheck = await pool.query(
    'SELECT id FROM foods WHERE id = $1 AND user_id = $2',
    [foodId, DEV_USER_ID]
  );
  if (foodCheck.rows.length === 0) {
    return res.status(400).json({ error: 'No food exists with that id' });
  }

  const result = await pool.query<FoodEntry>(
    `UPDATE food_entries
     SET food_id = $1, date = $2, grams = $3, meal_type = $4
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [foodId, date, grams, mealType, id, DEV_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.json(result.rows[0]);
}

export async function deleteEntry(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const result = await pool.query(
    'DELETE FROM food_entries WHERE id = $1 AND user_id = $2',
    [id, DEV_USER_ID]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.status(204).send();
}