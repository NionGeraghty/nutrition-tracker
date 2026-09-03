import { getTranslations } from 'next-intl/server';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('forgotPasswordTitle')}</h1>
      <ForgotPasswordForm />
    </main>
  );
}