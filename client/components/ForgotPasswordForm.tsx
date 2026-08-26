'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordForm() {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border p-4 rounded max-w-sm space-y-2">
        <p>{t('forgotSuccessTitle')}</p>
        <p className="text-sm text-gray-600">{t('forgotSuccessNote')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        setSubmitted(true);
      }}
      className="border p-4 rounded space-y-3 max-w-sm"
    >
      <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full" required />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">{t('sendResetLink')}</button>
    </form>
  );
}