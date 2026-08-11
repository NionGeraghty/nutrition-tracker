'use client';

import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border p-4 rounded max-w-sm space-y-2">
        <p>If that email exists, a reset link has been created.</p>
        <p className="text-sm text-gray-600">
          This app doesn&apos;t send real emails yet — ask Ross directly for your reset link.
        </p>
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
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">
        Send reset link
      </button>
    </form>
  );
}