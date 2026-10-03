import { pool } from '../db';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface DayData {
  totals: Macros;
  goals: Macros | null;
  remaining: Macros | null;
  eaten: string[];
}

export async function getDayData(userId: string, date: string): Promise<DayData> {
  const entries = await pool.query(
    `SELECT food_entries.grams, foods.name,
            foods.calories_per_100g, foods.protein_per_100g, foods.carbs_per_100g,
            foods.fat_per_100g, foods.fibre_per_100g
     FROM food_entries
     JOIN foods ON food_entries.food_id = foods.id
     WHERE food_entries.date = $1 AND food_entries.user_id = $2`,
    [date, userId]
  );

  const totals: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  for (const row of entries.rows) {
    const factor = Number(row.grams) / 100;
    totals.calories += factor * Number(row.calories_per_100g);
    totals.protein += factor * Number(row.protein_per_100g);
    totals.carbs += factor * Number(row.carbs_per_100g);
    totals.fat += factor * Number(row.fat_per_100g);
    totals.fibre += factor * Number(row.fibre_per_100g);
  }

  const eaten: string[] = Array.from(new Set<string>(entries.rows.map((r) => r.name as string)));

  const goalsResult = await pool.query('SELECT * FROM daily_goals WHERE user_id = $1', [userId]);
  if (goalsResult.rows.length === 0) {
    return { totals, goals: null, remaining: null, eaten };
  }

  const g = goalsResult.rows[0];
  const goals: Macros = {
    calories: Number(g.calories),
    protein: Number(g.protein),
    carbs: Number(g.carbs),
    fat: Number(g.fat),
    fibre: Number(g.fibre),
  };

  const remaining: Macros = {
    calories: goals.calories - totals.calories,
    protein: goals.protein - totals.protein,
    carbs: goals.carbs - totals.carbs,
    fat: goals.fat - totals.fat,
    fibre: goals.fibre - totals.fibre,
  };

  return { totals, goals, remaining, eaten };
}