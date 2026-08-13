import { Router } from 'express';
import { createRecipe, getRecipes, getRecipeIngredients } from '../controllers/recipeController';

const router = Router();

router.post('/', createRecipe);
router.get('/', getRecipes);
router.get('/:id/ingredients', getRecipeIngredients);

export default router;