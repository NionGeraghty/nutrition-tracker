'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GrantedAccount } from '@/types';

interface Food {
  id: string;
  name: string;
}

export default function LogEntryForm({
  foods,
  date,
  userId,
  grantedToMe,
}: {
  foods: Food[];
  date: string;
  userId: string;
  grantedToMe: GrantedAccount[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(userId);
  const [availableFoods, setAvailableFoods] = useState<Food[]>(foods);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [foodId, setFoodId] = useState('');
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [error, setError] = useState('');

  useEffect(() => {
    if (target === userId) {
      setAvailableFoods(foods);
      setFoodId('');
      return;
    }

    setLoadingFoods(true);
    fetch(`/api/foods?forUserId=${target}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setAvailableFoods(Array.isArray(data) ? data : []);
        setFoodId('');
        setLoadingFoods(false);
      });
  }, [target, userId, foods]);

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

            const response = await fetch('/api/entries', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                foodId,
                date,
                grams: Number(grams),
                mealType,
                targetUserId: target,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              setError(data.error ?? 'Failed to log entry.');
              return;
            }

            setFoodId('');
            setGrams('');
            router.refresh();
          }}
          className="p-4 pt-0 space-y-3"
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {grantedToMe.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Log to</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value={userId}>Me</option>
                {grantedToMe.map((account) => (
                <option key={account.id} value={account.owner_id}>
                  {account.email}
                </option>
              ))}
              </select>
            </div>
          )}

          <select
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            className="border p-2 rounded w-full"
            required
            disabled={loadingFoods}
          >
            <option value="" disabled>
              {loadingFoods ? 'Loading foods...' : 'Select a food'}
            </option>
            {availableFoods.map((food) => (
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
          </div>
        </form>
      )}
    </div>
  );
}