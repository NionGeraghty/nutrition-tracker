'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl';
import { Food } from '@/types';

interface Recipe {
  id: string;
  name: string;
  total_grams: string;
  calories_per_100g: string | null;
  protein_per_100g: string | null;
  carbs_per_100g: string | null;
  fat_per_100g: string | null;
  fibre_per_100g: string | null;
}

interface IngredientRow {
  foodId: string;
  grams: string;
}

export default function RecipeItem({ recipe, foods }: { recipe: Recipe; foods: Food[] }) {
  const router = useRouter();
  const t = useTranslations('Recipes');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(recipe.name);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [error, setError] = useState('');

  async function startEditing() {
    setLoading(true);
    const response = await fetch(`/api/recipes/${recipe.id}/ingredients`, { credentials: 'include' });
    const data = await response.json();
    setIngredients(data.map((i: any) => ({ foodId: i.food_id, grams: i.grams })));
    setName(recipe.name);
    setLoading(false);
    setIsEditing(true);
  }

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, { foodId: '', grams: '' }]);
  }

  function removeIngredientRow(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDelete() {
    const confirmed = window.confirm(`${t('delete')} ${recipe.name}?`);
    if (!confirmed) return;

    await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE', credentials: 'include' });
    router.refresh();
  }

  if (isEditing) {
    return (
      <li className="border border-primary rounded p-3 space-y-3">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded w-full" />

        <div className="space-y-2">
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={ing.foodId}
                onChange={(e) => updateIngredient(index, 'foodId', e.target.value)}
                className="border p-2 rounded flex-1"
              >
                <option value="" disabled>{t('selectAFood')}</option>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>{food.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder={t('grams')}
                value={ing.grams}
                onChange={(e) => updateIngredient(index, 'grams', e.target.value)}
                className="border p-2 rounded w-24"
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredientRow(index)} className="text-red-600 text-sm">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addIngredientRow} className="text-sm text-primary underline">
          {t('addIngredient')}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              setError('');
              const response = await fetch(`/api/recipes/${recipe.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  ingredients: ingredients.map((ing) => ({ foodId: ing.foodId, grams: Number(ing.grams) })),
                }),
              });

              if (!response.ok) {
                const data = await response.json();
                setError(data.error ?? t('updateError'));
                return;
              }

              setIsEditing(false);
              router.refresh();
            }}
            className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded text-sm transition"
          >
            {t('save')}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="border border-gray-300 px-3 py-1 rounded text-sm">
            {t('cancel')}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      onClick={startEditing}
      className="border rounded flex justify-between items-center p-3 cursor-pointer hover:bg-primary-light hover:border-primary transition"
    >
      <div>
        <div className="font-semibold">{recipe.name}</div>
        <div className="text-sm text-gray-600">
          {t('totalGrams', { grams: recipe.total_grams })}
          {recipe.calories_per_100g && (
            <>
              {' · '}
              {recipe.calories_per_100g} {t('cal')} · {recipe.protein_per_100g}g {t('proteinUnit')} ·{' '}
              {recipe.carbs_per_100g}g {t('carbsUnit')} · {recipe.fat_per_100g}g {t('fatUnit')} ·{' '}
              {recipe.fibre_per_100g}g {t('fibreUnit')} ({t('perHundredG')})
            </>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="text-sm text-red-600 underline shrink-0"
        disabled={loading}
      >
        {loading ? t('loading') : t('delete')}
      </button>
    </li>
  );
}