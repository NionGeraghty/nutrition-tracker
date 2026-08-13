import { Router } from 'express';
import { createRecipe, getRecipes, getRecipeIngredients, updateRecipe } from '../controllers/recipeController';

const router = Router();

router.post('/', createRecipe);
router.get('/', getRecipes);
router.get('/:id/ingredients', getRecipeIngredients);
router.put('/:id', updateRecipe);

export default router;