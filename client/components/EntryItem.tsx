'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Entry, Food } from '@/types';

export default function EntryItem({ entry, foods, targetUserId }: { entry: Entry; foods: Food[]; targetUserId: string }) {
  const router = useRouter();
  const t = useTranslations('Today');
  const [isEditing, setIsEditing] = useState(false);
  const [foodId, setFoodId] = useState(entry.food_id);
  const [grams, setGrams] = useState(entry.grams);
  const [mealType, setMealType] = useState(entry.meal_type);

  const numGrams = Number(entry.grams);
  const factor = numGrams / 100;
  const calories = factor * Number(entry.calories_per_100g);
  const protein = factor * Number(entry.protein_per_100g);
  const carbs = factor * Number(entry.carbs_per_100g);
  const fat = factor * Number(entry.fat_per_100g);
  const fibre = factor * Number(entry.fibre_per_100g);

  async function handleSave() {
    await fetch(`/api/entries/${entry.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId, date: entry.date, grams: Number(grams), mealType, targetUserId }),
    });
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
      <li className="border p-2 rounded space-y-2 text-sm">
        <select value={foodId} onChange={(e) => setFoodId(e.target.value)} className="border p-1 rounded w-full">
          {foods.map((food) => (
            <option key={food.id} value={food.id}>{food.name}</option>
          ))}
        </select>
        <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} className="border p-1 rounded w-full" />
        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="border p-1 rounded w-full">
          <option value="breakfast">{t('breakfast')}</option>
          <option value="lunch">{t('lunch')}</option>
          <option value="dinner">{t('dinner')}</option>
          <option value="snack">{t('snack')}</option>
          <option value="other">{t('other')}</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-black text-white px-3 py-1 rounded">{t('save')}</button>
          <button onClick={() => setIsEditing(false)} className="border px-3 py-1 rounded">{t('cancel')}</button>
        </div>
      </li>
    );
  }

  return (
    <li className="border p-2 rounded flex justify-between items-center text-sm">
      <div>
        <div>{entry.name} — {entry.grams}g</div>
        <div className="text-gray-600">
          {calories.toFixed(0)} {t('cal')} · {protein.toFixed(1)}g {t('proteinUnit')} ·{' '}
          {carbs.toFixed(1)}g {t('carbsUnit')} · {fat.toFixed(1)}g {t('fatUnit')} · {fibre.toFixed(1)}g {t('fibreUnit')}
        </div>
      </div>
      <div className="flex gap-2 shrink-0 ml-2">
        <button onClick={() => setIsEditing(true)} className="underline">{t('edit')}</button>
        <button onClick={handleDelete} className="text-red-600 underline">{t('delete')}</button>
      </div>
    </li>
  );
}