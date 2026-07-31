'use client';

import { useRouter } from 'next/navigation';

interface Entry {
  id: string;
  grams: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

export default function EntryItem({ entry }: { entry: Entry }) {
  const router = useRouter();

  const grams = Number(entry.grams);
  const factor = grams / 100;
  const calories = factor * Number(entry.calories_per_100g);
  const protein = factor * Number(entry.protein_per_100g);
  const carbs = factor * Number(entry.carbs_per_100g);
  const fat = factor * Number(entry.fat_per_100g);
  const fibre = factor * Number(entry.fibre_per_100g);

  async function handleDelete() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries/${entry.id}`, {
      method: 'DELETE',
    });
    router.refresh();
  }

  return (
    <li className="border p-2 rounded flex justify-between items-center text-sm">
      <div>
        <div>
          {entry.name} — {entry.grams}g
        </div>
        <div className="text-gray-600">
          {calories.toFixed(0)} cal · {protein.toFixed(1)}g protein ·{' '}
          {carbs.toFixed(1)}g carbs · {fat.toFixed(1)}g fat · {fibre.toFixed(1)}g fibre
        </div>
      </div>
      <button onClick={handleDelete} className="text-red-600 underline shrink-0 ml-2">
        Delete
      </button>
    </li>
  );
}