import { Router } from 'express';
import { createRecipe, getRecipes, getRecipeIngredients, updateRecipe, deleteRecipe } from '../controllers/recipeController';

const router = Router();

router.post('/', createRecipe);
router.get('/', getRecipes);
router.get('/:id/ingredients', getRecipeIngredients);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;