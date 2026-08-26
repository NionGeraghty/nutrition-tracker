'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <p className="text-red-600">
        {t('missingToken')}{' '}
        <Link href="/forgot-password" className="underline">{t('forgotPasswordPage')}</Link>.
      </p>
    );
  }

  if (success) {
    return (
      <div className="border p-4 rounded max-w-sm space-y-2">
        <p>{t('resetSuccess')}</p>
        <Link href="/login" className="underline">{t('logIn')}</Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? t('resetFailed'));
          return;
        }

        setSuccess(true);
      }}
      className="border p-4 rounded space-y-3 max-w-sm"
    >
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input type="password" placeholder={t('newPasswordMin')} value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full" required minLength={8} />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">{t('resetPassword')}</button>
    </form>
  );
}