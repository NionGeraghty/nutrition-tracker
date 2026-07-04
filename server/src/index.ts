import express from 'express';
import { Food } from './types';

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});