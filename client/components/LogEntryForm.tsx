'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Food } from '@/types';

export default function LogEntryForm({ foods, date }: { foods: Food[]; date: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [foodId, setFoodId] = useState('');
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [error, setError] = useState('');

  return (
    <div className="border rounded max-w-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 font-semibold flex justify-between items-center"
      >
        Log food
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                foodId,
                date,
                grams: Number(grams),
                mealType,
              }),
            });

            if (!response.ok) {
              setError('Failed to log entry.');
              return;
            }

            setFoodId('');
            setGrams('');
            router.refresh();
          }}
          className="p-4 pt-0 space-y-3"
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <select
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="" disabled>
              Select a food
            </option>
            {foods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Grams"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Log entry
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="border px-4 py-2 rounded"
            >
              Done
            </button>
          </div>
        </form>
      )}
    </div>
  );
}