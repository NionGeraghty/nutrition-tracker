import { Request, Response } from 'express';
import { pool } from '../db';
import { FoodEntry } from '../types';

export async function createEntry(req: Request, res: Response) {
  const { foodId, date, grams, mealType, targetUserId } = req.body;

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

  const target = typeof targetUserId === 'string' ? targetUserId : req.session.userId!;

  if (target !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [target, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to log to this account' });
    }
  }

  const foodCheck = await pool.query(
    'SELECT id FROM foods WHERE id = $1 AND user_id = $2',
    [foodId, target]
  );
  if (foodCheck.rows.length === 0) {
    return res.status(400).json({ error: 'No food exists with that id for this account' });
  }

  const result = await pool.query<FoodEntry>(
    `INSERT INTO food_entries (food_id, date, grams, meal_type, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [foodId, date, grams, mealType, target]
  );

  res.status(201).json(result.rows[0]);
}

export async function getEntriesByDate(req: Request, res: Response) {
  const { date, forUserId } = req.query;

  if (typeof date !== 'string') {
    return res.status(400).json({ error: 'A date query parameter is required' });
  }

  let targetUserId = req.session.userId!;

  if (typeof forUserId === 'string' && forUserId !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [forUserId, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to view this account\'s entries' });
    }
    targetUserId = forUserId;
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
    [date, targetUserId]
  );

  res.json(result.rows);
}

export async function updateEntry(req: Request, res: Response) {
  const { id } = req.params;
  const { foodId, date, grams, mealType, targetUserId: bodyTargetUserId } = req.body;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

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

  let targetUserId = req.session.userId!;

  if (typeof bodyTargetUserId === 'string' && bodyTargetUserId !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [bodyTargetUserId, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to edit this account\'s entries' });
    }
    targetUserId = bodyTargetUserId;
  }

  const foodCheck = await pool.query(
    'SELECT id FROM foods WHERE id = $1 AND user_id = $2',
    [foodId, targetUserId]
  );
  if (foodCheck.rows.length === 0) {
    return res.status(400).json({ error: 'No food exists with that id' });
  }

  const result = await pool.query<FoodEntry>(
    `UPDATE food_entries
     SET food_id = $1, date = $2, grams = $3, meal_type = $4
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [foodId, date, grams, mealType, id, targetUserId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.json(result.rows[0]);
}

export async function deleteEntry(req: Request, res: Response) {
  const { id } = req.params;
  const { forUserId } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  let targetUserId = req.session.userId!;

  if (typeof forUserId === 'string' && forUserId !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [forUserId, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to delete from this account' });
    }
    targetUserId = forUserId;
  }

  const result = await pool.query(
    'DELETE FROM food_entries WHERE id = $1 AND user_id = $2',
    [id, targetUserId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.status(204).send();
}

export async function copyEntries(req: Request, res: Response) {
  const { fromDate, toDate, targetUserId: bodyTargetUserId } = req.body;

  if (typeof fromDate !== 'string' || typeof toDate !== 'string') {
    return res.status(400).json({ error: 'fromDate and toDate are required' });
  }

  let targetUserId = req.session.userId!;

  if (typeof bodyTargetUserId === 'string' && bodyTargetUserId !== req.session.userId) {
    const permCheck = await pool.query(
      'SELECT id FROM editor_permissions WHERE owner_id = $1 AND editor_id = $2',
      [bodyTargetUserId, req.session.userId]
    );
    if (permCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to edit this account\'s entries' });
    }
    targetUserId = bodyTargetUserId;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sourceEntries = await client.query(
      'SELECT food_id, grams, meal_type FROM food_entries WHERE date = $1 AND user_id = $2',
      [fromDate, targetUserId]
    );

    if (sourceEntries.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No entries found for that date' });
    }

    for (const entry of sourceEntries.rows) {
      await client.query(
        `INSERT INTO food_entries (food_id, date, grams, meal_type, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [entry.food_id, toDate, entry.grams, entry.meal_type, targetUserId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ copied: sourceEntries.rows.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to copy entries' });
  } finally {
    client.release();
  }
}