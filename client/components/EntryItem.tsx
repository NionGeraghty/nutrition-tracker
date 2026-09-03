'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Entry, Food } from '@/types';

export default function EntryItem({ entry, foods, targetUserId }: { entry: Entry; foods: Food[]; targetUserId: string }) {
  const router = useRouter();
  const t = useTranslations('Today');
  const [isEditing, setIsEditing] = useState(false);
  const [foodId, setFoodId] = useState(entry.food_id);
  const [unit, setUnit] = useState<'grams' | 'portions'>('grams');
  const [amount, setAmount] = useState(entry.grams);
  const [mealType, setMealType] = useState(entry.meal_type);
  const [error, setError] = useState('');

  const numGrams = Number(entry.grams);
  const factor = numGrams / 100;
  const calories = factor * Number(entry.calories_per_100g);
  const protein = factor * Number(entry.protein_per_100g);
  const carbs = factor * Number(entry.carbs_per_100g);
  const fat = factor * Number(entry.fat_per_100g);
  const fibre = factor * Number(entry.fibre_per_100g);

  const selectedFood = foods.find((f) => f.id === foodId);
  const hasPortionSize = selectedFood?.portion_grams != null;

  function handleFoodChange(id: string) {
    setFoodId(id);
    setUnit('grams');
    setAmount('');
  }

  function calculateGrams(): number {
    if (unit === 'grams') {
      return Number(amount);
    }
    const portionSize = Number(selectedFood?.portion_grams ?? 0);
    return Number(amount) * portionSize;
  }

  async function handleSave() {
    const grams = calculateGrams();

    const response = await fetch(`/api/entries/${entry.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId, date: entry.date, grams, mealType, targetUserId }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Failed to save.');
      return;
    }

    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    await fetch(`/api/entries/${entry.id}?forUserId=${targetUserId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.refresh();
  }

  if (isEditing) {
    return (
      <li className="border border-primary rounded p-2 space-y-2 text-sm">
        <select value={foodId} onChange={(e) => handleFoodChange(e.target.value)} className="border p-1 rounded w-full">
          {foods.map((food) => (
            <option key={food.id} value={food.id}>{food.name}</option>
          ))}
        </select>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        {hasPortionSize && (
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value as 'grams' | 'portions');
              setAmount('');
            }}
            className="border p-1 rounded w-full"
          >
            <option value="grams">{t('grams')}</option>
            <option value="portions">{t('portions')}</option>
          </select>
        )}

        <input
          type="number"
          placeholder={unit === 'grams' ? t('grams') : t('numberOfPortions')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-1 rounded w-full"
          step={unit === 'portions' ? '0.1' : '1'}
        />

        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="border p-1 rounded w-full">
          <option value="breakfast">{t('breakfast')}</option>
          <option value="lunch">{t('lunch')}</option>
          <option value="dinner">{t('dinner')}</option>
          <option value="snack">{t('snack')}</option>
          <option value="other">{t('other')}</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded transition">{t('save')}</button>
          <button onClick={() => setIsEditing(false)} className="border border-gray-300 px-3 py-1 rounded">{t('cancel')}</button>
        </div>
      </li>
    );
  }

  return (
    <li
      onClick={() => setIsEditing(true)}
      className="border rounded flex justify-between items-center p-2 text-sm cursor-pointer hover:bg-primary-light hover:border-primary transition"
    >
      <div>
        <div>{entry.name} — {entry.grams}g</div>
        <div className="text-gray-600">
          {calories.toFixed(0)} {t('cal')} · {protein.toFixed(1)}g {t('proteinUnit')} ·{' '}
          {carbs.toFixed(1)}g {t('carbsUnit')} · {fat.toFixed(1)}g {t('fatUnit')} · {fibre.toFixed(1)}g {t('fibreUnit')}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="text-sm text-red-600 underline shrink-0 ml-2"
      >
        {t('delete')}
      </button>
    </li>
  );
}