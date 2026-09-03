'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl';
import { Food } from '@/types';

interface IngredientRow {
  foodId: string;
  grams: string;
}

export default function CreateRecipeForm({ foods }: { foods: Food[] }) {
  const router = useRouter();
  const t = useTranslations('Recipes');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ foodId: '', grams: '' }]);
  const [error, setError] = useState('');

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, { foodId: '', grams: '' }]);
  }

  function removeIngredientRow(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="border rounded max-w-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 font-semibold flex justify-between items-center hover:bg-primary-light transition"
      >
        {t('createRecipe')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');

            const response = await fetch('/api/recipes', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                ingredients: ingredients.map((ing) => ({ foodId: ing.foodId, grams: Number(ing.grams) })),
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              setError(data.error ?? t('createError'));
              return;
            }

            setName('');
            setIngredients([{ foodId: '', grams: '' }]);
            router.refresh();
          }}
          className="p-4 pt-0 space-y-3"
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <input
            type="text"
            placeholder={t('recipeName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={ing.foodId}
                  onChange={(e) => updateIngredient(index, 'foodId', e.target.value)}
                  className="border p-2 rounded flex-1"
                  required
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
                  required
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

          <div>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded transition">
              {t('submit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}