import { Router } from 'express';
import { getAllFoods, getFoodById, createFood, updateFood, deleteFood } from '../controllers/foodController';
import { searchExternalFoods } from '../controllers/foodSearchController';

const router = Router();

router.get('/', getAllFoods);
router.get('/search-external', searchExternalFoods);
router.get('/:id', getFoodById);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;