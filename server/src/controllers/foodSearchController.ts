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

function calculateCaloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return protein * 4 + carbs * 4 + fat * 9;
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
  const errorBody = await response.text();
  console.log('USDA API error:', response.status, errorBody);
  return res.status(502).json({ error: 'Failed to search external food database' });
}

  const data = await response.json();

  const results = data.foods.map((food: any) => {
  const protein = extractNutrient(food.foodNutrients, NUTRIENT_IDS.protein);
  const carbs = extractNutrient(food.foodNutrients, NUTRIENT_IDS.carbs);
  const fat = extractNutrient(food.foodNutrients, NUTRIENT_IDS.fat);
  const fibre = extractNutrient(food.foodNutrients, NUTRIENT_IDS.fibre);
  let calories = extractNutrient(food.foodNutrients, NUTRIENT_IDS.calories);

  if (calories === 0 && (protein > 0 || carbs > 0 || fat > 0)) {
    calories = Math.round(calculateCaloriesFromMacros(protein, carbs, fat));
  }

  return {
    name: food.description,
    caloriesPer100g: calories,
    proteinPer100g: protein,
    carbsPer100g: carbs,
    fatPer100g: fat,
    fibrePer100g: fibre,
  };
});

  res.json(results);
}