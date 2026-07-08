import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Food } from '../types';

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

export function getAllFoods(req: Request, res: Response) {
  res.json(foods);
}

export function getFoodById(req: Request, res: Response) {
  const food = foods.find((f) => f.id === req.params.id);
  if (!food) {
    return res.status(404).json({ error: 'Food not found' });
  }
  res.json(food);
}

export function createFood(req: Request, res: Response) {
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

  const newFood: Food = {
    id: randomUUID(),
    name,
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    fibrePer100g,
  };

  foods.push(newFood);
  res.status(201).json(newFood);
}

export function updateFood(req: Request, res: Response) {

  const { id } = req.params;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const index = foods.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Food not found' });
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

  const updatedFood: Food = {
    id,
    name,
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    fibrePer100g,
  };

  foods[index] = updatedFood;
  res.json(updatedFood);
}

export function deleteFood(req: Request, res: Response) {
  const index = foods.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Food not found' });
  }
  foods.splice(index, 1);
  res.status(204).send();
}