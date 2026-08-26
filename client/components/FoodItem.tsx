'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Food } from '@/types';

export default function FoodItem({ food }: { food: Food }) {
  const router = useRouter();
  const t = useTranslations('Foods');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(food.name);
  const [calories, setCalories] = useState(food.calories_per_100g);
  const [protein, setProtein] = useState(food.protein_per_100g);
  const [carbs, setCarbs] = useState(food.carbs_per_100g);
  const [fat, setFat] = useState(food.fat_per_100g);
  const [fibre, setFibre] = useState(food.fibre_per_100g);

  async function handleSave() {
    await fetch(`/api/foods/${food.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        caloriesPer100g: Number(calories),
        proteinPer100g: Number(protein),
        carbsPer100g: Number(carbs),
        fatPer100g: Number(fat),
        fibrePer100g: Number(fibre),
      }),
    });

    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(t('deleteConfirm', { name: food.name }));
    if (!confirmed) return;

    await fetch(`/api/foods/${food.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    router.refresh();
  }

  function handleArrowNav(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const container = e.currentTarget.closest('li');
    if (!container) return;
    const inputs = Array.from(container.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown' && currentIndex < inputs.length - 1) {
      e.preventDefault();
      inputs[currentIndex + 1].focus();
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      inputs[currentIndex - 1].focus();
    }
  }

  if (isEditing) {
    return (
      <li className="border p-3 rounded space-y-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('caloriesPer100g')}</label>
            <input value={calories} onChange={(e) => setCalories(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('proteinPer100g')}</label>
            <input value={protein} onChange={(e) => setProtein(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('carbsPer100g')}</label>
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('fatPer100g')}</label>
            <input value={fat} onChange={(e) => setFat(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('fibrePer100g')}</label>
            <input value={fibre} onChange={(e) => setFibre(e.target.value)} onKeyDown={handleArrowNav} className="border p-1 rounded w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-black text-white px-3 py-1 rounded text-sm">{t('save')}</button>
          <button onClick={() => setIsEditing(false)} className="border px-3 py-1 rounded text-sm">{t('cancel')}</button>
        </div>
      </li>
    );
  }

  return (
    <li className="border p-2 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
      <div>
        <div className="font-semibold">{food.name}</div>
        <div className="text-sm text-gray-600">
          {food.calories_per_100g} {t('cal')} · {food.protein_per_100g}g {t('proteinUnit')} ·{' '}
          {food.carbs_per_100g}g {t('carbsUnit')} · {food.fat_per_100g}g {t('fatUnit')} · {food.fibre_per_100g}g {t('fibreUnit')}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-sm underline">{t('edit')}</button>
        <button onClick={handleDelete} className="text-sm text-red-600 underline">{t('delete')}</button>
      </div>
    </li>
  );
}