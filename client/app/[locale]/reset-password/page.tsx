import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('resetPasswordTitle')}</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}