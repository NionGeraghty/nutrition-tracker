'use client';

import EntryItem from './EntryItem';
import { Entry, Food } from '@/types';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

export default function EntriesList({ entries, foods, targetUserId }: { entries: Entry[]; foods: Food[]; targetUserId: string }) {
  const grouped = MEAL_ORDER.map((mealType) => ({
    mealType,
    items: entries.filter((entry) => entry.meal_type === mealType),
  })).filter((group) => group.items.length > 0);

  if (entries.length === 0) {
    return <p>Nothing logged yet today.</p>;
  }

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.mealType}>
          <h3 className="font-semibold capitalize mb-2">{group.mealType}</h3>
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