import CreateFoodForm from '@/components/CreateFoodForm';
import FoodsList from '@/components/FoodsList';
import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Food, GrantedAccount } from '@/types';

async function getFoods(): Promise<Food[]> {
  const response = await serverFetch('/foods');
  return response.json();
}

async function getGrantedToMe(): Promise<GrantedAccount[]> {
  const response = await serverFetch('/editors/granted-to-me');
  return response.json();
}

export default async function FoodsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/foods');
  }

  const [foods, grantedToMe] = await Promise.all([getFoods(), getGrantedToMe()]);
  console.log('grantedToMe:', JSON.stringify(grantedToMe));

  return (
    <main className="p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Foods</h1>
        <p className="text-sm text-gray-500 mb-4">Your personal database of foods and their nutrition values</p>
      </div>
      <CreateFoodForm grantedToMe={grantedToMe} userId={user.id} />
      <FoodsList foods={foods} />
    </main>
  );
}