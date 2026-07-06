import express from 'express';
import { Food } from './types';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 4000;
app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('Nutrition tracker API is running');
});

app.get('/foods', (req, res) => {
  res.json(foods);
});

app.post('/foods', (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});