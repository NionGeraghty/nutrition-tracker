'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <p className="text-red-600">
        This reset link is missing a token. Please request a new one from the{' '}
        <Link href="/forgot-password" className="underline">
          forgot password page
        </Link>
        .
      </p>
    );
  }

  if (success) {
    return (
      <div className="border p-4 rounded max-w-sm space-y-2">
        <p>Your password has been reset.</p>
        <Link href="/login" className="underline">
          Log in
        </Link>
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
          setError(data.error ?? 'Failed to reset password.');
          return;
        }

        setSuccess(true);
      }}
      className="border p-4 rounded space-y-3 max-w-sm"
    >
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="password"
        placeholder="New password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full"
        required
        minLength={8}
      />

      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">
        Reset password
      </button>
    </form>
  );
}