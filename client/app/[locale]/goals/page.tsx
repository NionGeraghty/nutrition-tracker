import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Goals } from '@/types';
import GoalsForm from '@/components/GoalsForm';

async function getGoals(): Promise<Goals | null> {
  const response = await serverFetch('/goals');
  if (response.status === 404) return null;
  return response.json();
}

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/goals');
  }

  const t = await getTranslations('Goals');
  const goals = await getGoals();

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <GoalsForm goals={goals} />
    </main>
  );
}