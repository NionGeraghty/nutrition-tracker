'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CopyDayButton({
  toDate,
  targetUserId,
}: {
  toDate: string;
  targetUserId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="border rounded max-w-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 text-sm font-medium flex justify-between items-center"
      >
        Copy from another day
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 space-y-2">
          {error && <p className="text-red-600 text-xs">{error}</p>}
          {message && <p className="text-green-600 text-xs">{message}</p>}

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded w-full text-sm"
          />

          <button
            type="button"
            disabled={!fromDate || loading}
            onClick={async () => {
              setError('');
              setMessage('');
              setLoading(true);

              const response = await fetch('/api/entries/copy', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromDate, toDate, targetUserId }),
              });

              const data = await response.json();
              setLoading(false);

              if (!response.ok) {
                setError(data.error ?? 'Failed to copy entries.');
                return;
              }

              setMessage(`Copied ${data.copied} entr${data.copied === 1 ? 'y' : 'ies'}.`);
              router.refresh();
            }}
            className="bg-black text-white px-3 py-2 rounded text-sm w-full disabled:opacity-50"
          >
            {loading ? 'Copying...' : 'Copy entries'}
          </button>
        </div>
      )}
    </div>
  );
}