import CreateFoodForm from '@/components/CreateFoodForm';
import FoodsList from '@/components/FoodsList';
import { Food } from '@/types';
import { serverFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

async function getFoods(): Promise<Food[]> {
  const response = await serverFetch('/foods', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch foods');
  }

  return response.json();
}

export default async function FoodsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  
  const foods = await getFoods();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Foods</h1>
      <CreateFoodForm />
      <FoodsList foods={foods} />
    </main>
  );
}