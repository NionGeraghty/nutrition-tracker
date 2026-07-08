import express from 'express';
import foodRoutes from './routes/foodRoutes';

const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Nutrition tracker API is running');
});

app.use('/foods', foodRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});