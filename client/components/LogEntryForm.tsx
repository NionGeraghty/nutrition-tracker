'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Food {
  id: string;
  name: string;
}

export default function LogEntryForm({
  foods,
  date,
  targetUserId,
}: {
  foods: Food[];
  date: string;
  targetUserId: string;
}) {
  const router = useRouter();
  const t = useTranslations('Today');
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
        {t('logFood')}
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
                targetUserId,
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              setError(data.error ?? t('logError'));
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
            <option value="" disabled>{t('selectAFood')}</option>
            {foods.map((food) => (
              <option key={food.id} value={food.id}>{food.name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder={t('grams')}
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
            <option value="breakfast">{t('breakfast')}</option>
            <option value="lunch">{t('lunch')}</option>
            <option value="dinner">{t('dinner')}</option>
            <option value="snack">{t('snack')}</option>
            <option value="other">{t('other')}</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              {t('logEntry')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}