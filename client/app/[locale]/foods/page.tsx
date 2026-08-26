import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Food, GrantedAccount } from '@/types';
import CreateFoodForm from '@/components/CreateFoodForm';
import FoodsList from '@/components/FoodsList';

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
  const locale = await getLocale();

  if (!user) {
    redirect({ href: '/login?redirect=/foods', locale });
  }

  const t = await getTranslations('Foods');
  const [foods, grantedToMe] = await Promise.all([getFoods(), getGrantedToMe()]);

  return (
    <main className="p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-4">{t('subtitle')}</p>
      </div>
      <CreateFoodForm grantedToMe={grantedToMe} userId={user!.id} />
      <FoodsList foods={foods} />
    </main>
  );
}