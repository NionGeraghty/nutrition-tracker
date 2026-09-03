'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl';

interface EditorRelation {
  id: string;
  email: string;
}

export default function EditorsManager({
  myEditors,
  grantedToMe,
  unreciprocated,
}: {
  myEditors: EditorRelation[];
  grantedToMe: EditorRelation[];
  unreciprocated: EditorRelation[];
}) {
  const router = useRouter();
  const t = useTranslations('Editors');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function handleReciprocate(theirEmail: string) {
    await fetch('/api/editors', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: theirEmail }),
    });
    router.refresh();
  }

  async function handleRemove(id: string) {
    await fetch(`/api/editors/${id}`, { method: 'DELETE', credentials: 'include' });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {unreciprocated.length > 0 && (
        <div className="border border-accent bg-amber-50 rounded p-4 space-y-2">
          <h2 className="font-semibold text-sm">{t('returnFavour')}</h2>
          {unreciprocated.map((person) => (
            <div key={person.id} className="flex justify-between items-center text-sm">
              <span>{t('hasGivenAccess', { email: person.email })}</span>
              <button onClick={() => handleReciprocate(person.email)} className="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded text-xs transition">
                {t('giveAccessBack')}
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');

          const response = await fetch('/api/editors', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            const data = await response.json();
            setError(data.error ?? t('grantError'));
            return;
          }

          setEmail('');
          router.refresh();
        }}
        className="border p-4 rounded space-y-3 max-w-sm"
      >
        <h2 className="font-semibold">{t('grantTitle')}</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="email"
          placeholder={t('theirEmail')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded transition">{t('grantAccess')}</button>
      </form>

      <div>
        <h2 className="font-semibold mb-2">{t('myEditorsTitle')}</h2>
        {myEditors.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noEditors')}</p>
        ) : (
          <ul className="space-y-2">
            {myEditors.map((person) => (
              <li key={person.id} className="border p-2 rounded flex justify-between items-center text-sm">
                <span>{person.email}</span>
                <button onClick={() => handleRemove(person.id)} className="text-red-600 underline">{t('remove')}</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">{t('grantedToMeTitle')}</h2>
        {grantedToMe.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noneGranted')}</p>
        ) : (
          <ul className="space-y-2">
            {grantedToMe.map((person) => (
              <li key={person.id} className="border p-2 rounded text-sm">{person.email}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}