'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Entry, Food } from '@/types';

export default function EntryItem({ entry, foods }: { entry: Entry; foods: Food[] }) {
  const router = useRouter();
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
      body: JSON.stringify({
        foodId,
        date: entry.date,
        grams: Number(grams),
        mealType,
      }),
    });

    setIsEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    await fetch(`/api/entries/${entry.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.refresh();
  }

  if (isEditing) {
    return (
      <li className="border p-2 rounded space-y-2 text-sm">
        <select
          value={foodId}
          onChange={(e) => setFoodId(e.target.value)}
          className="border p-1 rounded w-full"
        >
          {foods.map((food) => (
            <option key={food.id} value={food.id}>
              {food.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          className="border p-1 rounded w-full"
        />
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="border p-1 rounded w-full"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="other">Other</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-black text-white px-3 py-1 rounded">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="border px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="border p-2 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
      <div>
        <div>
          {entry.name} — {entry.grams}g
        </div>
        <div className="text-gray-600">
          {calories.toFixed(0)} cal · {protein.toFixed(1)}g protein ·{' '}
          {carbs.toFixed(1)}g carbs · {fat.toFixed(1)}g fat · {fibre.toFixed(1)}g fibre
        </div>
      </div>
      <div className="flex gap-2 shrink-0 ml-2">
        <button onClick={() => setIsEditing(true)} className="underline">
          Edit
        </button>
        <button onClick={handleDelete} className="text-red-600 underline">
          Delete
        </button>
      </div>
    </li>
  );
}