'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Food } from '@/types';

export default function FoodItem({ food }: { food: Food }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(food.name);
  const [calories, setCalories] = useState(food.calories_per_100g);
  const [protein, setProtein] = useState(food.protein_per_100g);
  const [carbs, setCarbs] = useState(food.carbs_per_100g);
  const [fat, setFat] = useState(food.fat_per_100g);
  const [fibre, setFibre] = useState(food.fibre_per_100g);

  async function handleSave() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods/${food.id}`, {
      method: 'PUT',
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
    const confirmed = window.confirm(`Delete ${food.name}?`);
    if (!confirmed) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods/${food.id}`, {
      method: 'DELETE',
    });

    router.refresh();
  }

  if (isEditing) {
    return (
      <li className="border p-3 rounded space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="border p-1 rounded w-full" />
        <div className="grid grid-cols-2 gap-2">
          <input value={calories} onChange={(e) => setCalories(e.target.value)} className="border p-1 rounded" />
          <input value={protein} onChange={(e) => setProtein(e.target.value)} className="border p-1 rounded" />
          <input value={carbs} onChange={(e) => setCarbs(e.target.value)} className="border p-1 rounded" />
          <input value={fat} onChange={(e) => setFat(e.target.value)} className="border p-1 rounded" />
          <input value={fibre} onChange={(e) => setFibre(e.target.value)} className="border p-1 rounded" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-black text-white px-3 py-1 rounded text-sm">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="border px-3 py-1 rounded text-sm">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="border p-3 rounded flex justify-between items-center">
      <div>
        <div className="font-semibold">{food.name}</div>
        <div className="text-sm text-gray-600">
          {food.calories_per_100g} cal · {food.protein_per_100g}g protein ·{' '}
          {food.carbs_per_100g}g carbs · {food.fat_per_100g}g fat
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-sm underline">
          Edit
        </button>
        <button onClick={handleDelete} className="text-sm text-red-600 underline">
          Delete
        </button>
      </div>
    </li>
  );
}