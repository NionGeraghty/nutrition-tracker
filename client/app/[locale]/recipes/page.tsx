import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Food } from '@/types';
import CreateRecipeForm from '@/components/CreateRecipeForm';
import RecipeItem from '@/components/RecipeItem';

interface Recipe {
  id: string;
  name: string;
  total_grams: string;
  food_id: string | null;
  calories_per_100g: string | null;
  protein_per_100g: string | null;
  carbs_per_100g: string | null;
  fat_per_100g: string | null;
  fibre_per_100g: string | null;
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
  const locale = await getLocale();

  if (!user) {
    redirect({ href: '/login?redirect=/recipes', locale });
  }

  const t = await getTranslations('Recipes');
  const [foods, recipes] = await Promise.all([getFoods(), getRecipes()]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <CreateRecipeForm foods={foods} />

      {recipes.length === 0 ? (
        <p>{t('noRecipes')}</p>
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