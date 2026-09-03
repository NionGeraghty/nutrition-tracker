'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          setError(t('invalidCredentials'));
          return;
        }

        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
        router.refresh();
      }}
      className="border p-4 rounded space-y-3 max-w-sm"
    >
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full" required />
      <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full" required />

      <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded w-full transition">{t('logIn')}</button>

      <p className="text-sm text-gray-500">
        <Link href="/forgot-password" className="text-primary underline">{t('forgotYourPassword')}</Link>
      </p>

      <p className="text-sm text-gray-500">
        {t('noAccount')}{' '}
        <Link href="/signup" className="text-primary underline">{t('signUp')}</Link>
      </p>
    </form>
  );
}