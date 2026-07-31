import CreateFoodForm from '@/components/CreateFoodForm';
import FoodsList from '@/components/FoodsList';
import { Food } from '@/types';

async function getFoods(): Promise<Food[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch foods');
  }

  return response.json();
}

export default async function FoodsPage() {
  const foods = await getFoods();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Foods</h1>
      <CreateFoodForm />
      <FoodsList foods={foods} />
    </main>
  );
}