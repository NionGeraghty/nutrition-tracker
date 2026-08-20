import { Request, Response } from 'express';
import { pool } from '../db';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function createRecipe(req: Request, res: Response) {
  const { name, ingredients } = req.body;

  if (
    typeof name !== 'string' ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    !ingredients.every(
      (i) => typeof i.foodId === 'string' && typeof i.grams === 'number' && i.grams > 0
    )
  ) {
    return res.status(400).json({ error: 'Invalid recipe data' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const foodIds = ingredients.map((i) => i.foodId);
    const foodsResult = await client.query(
      `SELECT id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g
       FROM foods WHERE id = ANY($1) AND user_id = $2`,
      [foodIds, req.session.userId]
    );

    if (foodsResult.rows.length !== ingredients.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more ingredients do not exist' });
    }

    const foodsById = new Map(foodsResult.rows.map((f) => [f.id, f]));

    const totals = ingredients.reduce(
      (acc, ing) => {
        const food = foodsById.get(ing.foodId);
        const factor = ing.grams / 100;
        acc.calories += factor * Number(food.calories_per_100g);
        acc.protein += factor * Number(food.protein_per_100g);
        acc.carbs += factor * Number(food.carbs_per_100g);
        acc.fat += factor * Number(food.fat_per_100g);
        acc.fibre += factor * Number(food.fibre_per_100g);
        acc.totalGrams += ing.grams;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, totalGrams: 0 }
    );

    const recipeResult = await client.query(
      `INSERT INTO recipes (name, total_grams, user_id) VALUES ($1, $2, $3) RETURNING id`,
      [name, totals.totalGrams, req.session.userId]
    );
    const recipeId = recipeResult.rows[0].id;

    for (const ing of ingredients) {
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, food_id, grams) VALUES ($1, $2, $3)`,
        [recipeId, ing.foodId, ing.grams]
      );
    }

    const factor100g = 100 / totals.totalGrams;
    const foodResult = await client.query(
      `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g, user_id, recipe_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        round2(totals.calories * factor100g),
        round2(totals.protein * factor100g),
        round2(totals.carbs * factor100g),
        round2(totals.fat * factor100g),
        round2(totals.fibre * factor100g),
        req.session.userId,
        recipeId,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json(foodResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe' });
  } finally {
    client.release();
  }
}

export async function getRecipes(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT
       recipes.id,
       recipes.name,
       recipes.total_grams,
       foods.id AS food_id,
       foods.calories_per_100g,
       foods.protein_per_100g,
       foods.carbs_per_100g,
       foods.fat_per_100g,
       foods.fibre_per_100g
     FROM recipes
     LEFT JOIN foods ON foods.recipe_id = recipes.id
     WHERE recipes.user_id = $1
     ORDER BY recipes.created_at DESC`,
    [req.session.userId]
  );
  res.json(result.rows);
}

export async function getRecipeIngredients(req: Request, res: Response) {
  const { id } = req.params;

  const recipeCheck = await pool.query(
    'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
    [id, req.session.userId]
  );
  if (recipeCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  const result = await pool.query(
    `SELECT recipe_ingredients.grams, foods.name, foods.id AS food_id
     FROM recipe_ingredients
     JOIN foods ON recipe_ingredients.food_id = foods.id
     WHERE recipe_ingredients.recipe_id = $1`,
    [id]
  );

  res.json(result.rows);
}

export async function updateRecipe(req: Request, res: Response) {
  const { id } = req.params;
  const { name, ingredients } = req.body;

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    !ingredients.every(
      (i) => typeof i.foodId === 'string' && typeof i.grams === 'number' && i.grams > 0
    )
  ) {
    return res.status(400).json({ error: 'Invalid recipe data' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const recipeCheck = await client.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    if (recipeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const foodIds = ingredients.map((i) => i.foodId);
    const foodsResult = await client.query(
      `SELECT id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fibre_per_100g
       FROM foods WHERE id = ANY($1) AND user_id = $2`,
      [foodIds, req.session.userId]
    );

    if (foodsResult.rows.length !== ingredients.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more ingredients do not exist' });
    }

    const foodsById = new Map(foodsResult.rows.map((f) => [f.id, f]));

    const totals = ingredients.reduce(
      (acc, ing) => {
        const food = foodsById.get(ing.foodId);
        const factor = ing.grams / 100;
        acc.calories += factor * Number(food.calories_per_100g);
        acc.protein += factor * Number(food.protein_per_100g);
        acc.carbs += factor * Number(food.carbs_per_100g);
        acc.fat += factor * Number(food.fat_per_100g);
        acc.fibre += factor * Number(food.fibre_per_100g);
        acc.totalGrams += ing.grams;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, totalGrams: 0 }
    );

    await client.query('UPDATE recipes SET name = $1, total_grams = $2 WHERE id = $3', [
      name,
      totals.totalGrams,
      id,
    ]);

    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);

    for (const ing of ingredients) {
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, food_id, grams) VALUES ($1, $2, $3)`,
        [id, ing.foodId, ing.grams]
      );
    }

    const factor100g = 100 / totals.totalGrams;
    const foodResult = await client.query(
      `UPDATE foods
       SET name = $1, calories_per_100g = $2, protein_per_100g = $3, carbs_per_100g = $4, fat_per_100g = $5, fibre_per_100g = $6
       WHERE recipe_id = $7
       RETURNING *`,
      [
        name,
        round2(totals.calories * factor100g),
        round2(totals.protein * factor100g),
        round2(totals.carbs * factor100g),
        round2(totals.fat * factor100g),
        round2(totals.fibre * factor100g),
        id,
      ]
    );

    await client.query('COMMIT');

    res.json(foodResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update recipe' });
  } finally {
    client.release();
  }
}

export async function deleteRecipe(req: Request, res: Response) {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM recipes WHERE id = $1 AND user_id = $2',
    [id, req.session.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  res.status(204).send();
}