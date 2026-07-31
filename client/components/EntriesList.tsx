'use client';

import EntryItem from './EntryItem';

interface Entry {
  id: string;
  grams: string;
  meal_type: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

export default function EntriesList({ entries }: { entries: Entry[] }) {
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
            {group.items.map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}