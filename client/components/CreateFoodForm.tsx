'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateFoodForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="border rounded mb-6 max-w-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 font-semibold flex justify-between items-center"
      >
        Add a food
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods`, {
              method: 'POST',
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

            if (!response.ok) {
              setError('Failed to create food. Check your values and try again.');
              return;
            }

            setName('');
            setCalories('');
            setProtein('');
            setCarbs('');
            setFat('');
            setFibre('');

            router.refresh();
          }}
          className="p-4 pt-0 space-y-3"
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Calories per 100g"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Protein per 100g"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Carbs per 100g"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Fat per 100g"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Fibre per 100g"
              value={fibre}
              onChange={(e) => setFibre(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              Add food
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