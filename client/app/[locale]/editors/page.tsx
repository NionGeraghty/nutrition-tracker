import { getTranslations, getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import EditorsManager from '@/components/EditorsManager';

interface EditorRelation {
  id: string;
  email: string;
}

async function getMyEditors(): Promise<EditorRelation[]> {
  const response = await serverFetch('/editors/mine');
  return response.json();
}

async function getGrantedToMe(): Promise<EditorRelation[]> {
  const response = await serverFetch('/editors/granted-to-me');
  return response.json();
}

async function getUnreciprocated(): Promise<EditorRelation[]> {
  const response = await serverFetch('/editors/unreciprocated');
  return response.json();
}

export default async function EditorsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (!user) {
    redirect({ href: '/login?redirect=/editors', locale });
  }

  const t = await getTranslations('Editors');
  const [myEditors, grantedToMe, unreciprocated] = await Promise.all([
    getMyEditors(),
    getGrantedToMe(),
    getUnreciprocated(),
  ]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <EditorsManager myEditors={myEditors} grantedToMe={grantedToMe} unreciprocated={unreciprocated} />
    </main>
  );
}