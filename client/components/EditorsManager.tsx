'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    await fetch(`/api/editors/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {unreciprocated.length > 0 && (
        <div className="border border-amber-300 bg-amber-50 rounded p-4 space-y-2">
          <h2 className="font-semibold text-sm">Return the favour?</h2>
          {unreciprocated.map((person) => (
            <div key={person.id} className="flex justify-between items-center text-sm">
              <span>
                <strong>{person.email}</strong> has given you permission to edit their data.
              </span>
              <button
                onClick={() => handleReciprocate(person.email)}
                className="bg-black text-white px-3 py-1 rounded text-xs"
              >
                Give access back
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
            setError(data.error ?? 'Failed to grant access.');
            return;
          }

          setEmail('');
          router.refresh();
        }}
        className="border p-4 rounded space-y-3 max-w-sm"
      >
        <h2 className="font-semibold">Give someone permission to edit your data</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Their email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Grant access
        </button>
      </form>

      <div>
        <h2 className="font-semibold mb-2">People who can edit your data</h2>
        {myEditors.length === 0 ? (
          <p className="text-sm text-gray-500">No one yet.</p>
        ) : (
          <ul className="space-y-2">
            {myEditors.map((person) => (
              <li key={person.id} className="border p-2 rounded flex justify-between items-center text-sm">
                <span>{person.email}</span>
                <button onClick={() => handleRemove(person.id)} className="text-red-600 underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Accounts you can edit</h2>
        {grantedToMe.length === 0 ? (
          <p className="text-sm text-gray-500">No one has given you access yet.</p>
        ) : (
          <ul className="space-y-2">
            {grantedToMe.map((person) => (
              <li key={person.id} className="border p-2 rounded text-sm">
                {person.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}