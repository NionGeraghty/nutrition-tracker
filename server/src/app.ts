import express from 'express';
import foodRoutes from './routes/foodRoutes';
import entryRoutes from './routes/entryRoutes';
import goalRoutes from './routes/goalRoutes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Nutrition tracker API is running');
});

app.use('/foods', foodRoutes);
app.use('/entries', entryRoutes);
app.use('/goals', goalRoutes);

export default app;