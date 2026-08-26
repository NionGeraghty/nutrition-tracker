'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SignupForm() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? t('signUpFailed'));
          return;
        }

        router.push('/');
        router.refresh();
      }}
      className="border p-4 rounded space-y-3 max-w-sm"
    >
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full" required />
      <input type="password" placeholder={t('passwordMin')} value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full" required minLength={8} />

      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">{t('signUp')}</button>

      <p className="text-sm text-gray-600">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="underline">{t('logIn')}</Link>
      </p>
    </form>
  );
}