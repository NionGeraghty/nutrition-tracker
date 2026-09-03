'use client';

import { useTranslations } from 'next-intl';
import EntryItem from './EntryItem';
import { Entry, Food } from '@/types';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

export default function EntriesList({ entries, foods, targetUserId }: { entries: Entry[]; foods: Food[]; targetUserId: string }) {
  const t = useTranslations('Today');

  const mealLabels: Record<string, string> = {
    breakfast: t('breakfast'),
    lunch: t('lunch'),
    dinner: t('dinner'),
    snack: t('snack'),
    other: t('other'),
  };

  const grouped = MEAL_ORDER.map((mealType) => ({
    mealType,
    items: entries.filter((entry) => entry.meal_type === mealType),
  })).filter((group) => group.items.length > 0);

  if (entries.length === 0) {
    return <p>{t('nothingLogged')}</p>;
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.mealType}>
          <h3 className="font-semibold text-base text-gray-900 mb-3">{mealLabels[group.mealType]}</h3>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <EntryItem key={item.id} entry={item} foods={foods} targetUserId={targetUserId} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}