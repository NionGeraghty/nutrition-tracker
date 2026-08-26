'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FoodItem from './FoodItem';
import { Food } from '@/types';

export default function FoodsList({ foods }: { foods: Food[] }) {
  const t = useTranslations('Foods');
  const [search, setSearch] = useState('');

  const filtered = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder={t('searchFoodsPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-md mb-4"
      />

      {filtered.length === 0 ? (
        <p>{t('noFoods')}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </ul>
      )}
    </div>
  );
}