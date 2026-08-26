import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('logInTitle')}</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}