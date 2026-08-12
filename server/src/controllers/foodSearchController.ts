import { Request, Response } from 'express';

const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fibre: 1079,
};

function extractNutrient(foodNutrients: any[], nutrientId: number): number {
  const match = foodNutrients.find((n) => n.nutrientId === nutrientId);
  return match ? match.value : 0;
}

export async function searchExternalFoods(req: Request, res: Response) {
  const { q } = req.query;

  if (typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'A search query is required' });
  }

  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  url.searchParams.set('query', q);
  url.searchParams.set('api_key', process.env.USDA_API_KEY!);
  url.searchParams.set('dataType', 'Foundation,SR Legacy');
  url.searchParams.set('pageSize', '10');

  const response = await fetch(url.toString());

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to search external food database' });
  }

  const data = await response.json();

  const results = data.foods.map((food: any) => ({
    name: food.description,
    caloriesPer100g: extractNutrient(food.foodNutrients, NUTRIENT_IDS.calories),
    proteinPer100g: extractNutrient(food.foodNutrients, NUTRIENT_IDS.protein),
    carbsPer100g: extractNutrient(food.foodNutrients, NUTRIENT_IDS.carbs),
    fatPer100g: extractNutrient(food.foodNutrients, NUTRIENT_IDS.fat),
    fibrePer100g: extractNutrient(food.foodNutrients, NUTRIENT_IDS.fibre),
  }));

  res.json(results);
}