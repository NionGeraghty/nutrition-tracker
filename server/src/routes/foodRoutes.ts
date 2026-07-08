import { Router } from 'express';
import { getAllFoods, getFoodById, createFood, updateFood, deleteFood } from '../controllers/foodController';

const router = Router();

router.get('/', getAllFoods);
router.get('/:id', getFoodById);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;