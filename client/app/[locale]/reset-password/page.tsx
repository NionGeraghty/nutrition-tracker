import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('resetPasswordTitle')}</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}