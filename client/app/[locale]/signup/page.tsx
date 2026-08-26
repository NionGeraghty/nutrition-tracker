import { getTranslations } from 'next-intl/server';
import SignupForm from '@/components/SignupForm';

export default async function SignupPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('signUpTitle')}</h1>
      <SignupForm />
    </main>
  );
}