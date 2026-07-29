interface Food {
  id: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

async function getFoods(): Promise<Food[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch foods');
  }

  return response.json();
}

export default async function Home() {
  const foods = await getFoods();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Foods</h1>
      {foods.length === 0 ? (
        <p>No foods yet.</p>
      ) : (
        <ul className="space-y-2">
          {foods.map((food) => (
            <li key={food.id} className="border p-3 rounded">
              <div className="font-semibold">{food.name}</div>
              <div className="text-sm text-gray-600">
                {food.calories_per_100g} cal · {food.protein_per_100g}g protein ·{' '}
                {food.carbs_per_100g}g carbs · {food.fat_per_100g}g fat
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}