import { Request, Response } from 'express';
import { pool } from '../db';

const DEV_USER_ID = process.env.DEV_USER_ID;

export async function getSummary(req: Request, res: Response) {
  const { date } = req.query;

  if (typeof date !== 'string') {
    return res.status(400).json({ error: 'A date query parameter is required' });
  }

  const entriesResult = await pool.query(
    `SELECT
       food_entries.grams,
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

  const totals = entriesResult.rows.reduce(
    (acc, row) => {
      const factor = Number(row.grams) / 100;
      acc.calories += factor * Number(row.calories_per_100g);
      acc.protein += factor * Number(row.protein_per_100g);
      acc.carbs += factor * Number(row.carbs_per_100g);
      acc.fat += factor * Number(row.fat_per_100g);
      acc.fibre += factor * Number(row.fibre_per_100g);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 }
  );

  const goalsResult = await pool.query(
    'SELECT * FROM daily_goals WHERE user_id = $1',
    [DEV_USER_ID]
  );

  if (goalsResult.rows.length === 0) {
    return res.json({ date, totals, goals: null, remaining: null });
  }

  const goalsRow = goalsResult.rows[0];
  const goals = {
    calories: Number(goalsRow.calories),
    protein: Number(goalsRow.protein),
    carbs: Number(goalsRow.carbs),
    fat: Number(goalsRow.fat),
    fibre: Number(goalsRow.fibre),
  };

  const remaining = {
    calories: goals.calories - totals.calories,
    protein: goals.protein - totals.protein,
    carbs: goals.carbs - totals.carbs,
    fat: goals.fat - totals.fat,
    fibre: goals.fibre - totals.fibre,
  };

  res.json({ date, totals, goals, remaining });
}