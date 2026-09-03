import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
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
  const locale = await getLocale();

  if (!user) {
    redirect({ href: '/login?redirect=/goals', locale });
  }

  const t = await getTranslations('Goals');
  const goals = await getGoals();

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <GoalsForm goals={goals} />
    </main>
  );
}