import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Food } from '@/types';
import CreateRecipeForm from '@/components/CreateRecipeForm';
import RecipeItem from '@/components/RecipeItem';

interface Recipe {
  id: string;
  name: string;
  total_grams: string;
  food_id: string | null;
}

async function getFoods(): Promise<Food[]> {
  const response = await serverFetch('/foods');
  return response.json();
}

async function getRecipes(): Promise<Recipe[]> {
  const response = await serverFetch('/recipes');
  return response.json();
}

export default async function RecipesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/recipes');
  }

  const [foods, recipes] = await Promise.all([getFoods(), getRecipes()]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Recipes</h1>
        <p className="text-sm text-gray-500">
          Build a recipe from ingredients — it'll appear in your Foods list, ready to log
        </p>
      </div>

      <CreateRecipeForm foods={foods} />

      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <ul className="space-y-2">
          {recipes.map((recipe) => (
            <RecipeItem key={recipe.id} recipe={recipe} foods={foods} />
          ))}
        </ul>
      )}
    </main>
  );
}