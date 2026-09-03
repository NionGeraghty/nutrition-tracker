'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl';

function formatDateDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function getYesterday(toDate: string): string {
  const date = new Date(toDate);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export default function CopyDayButton({ toDate, targetUserId }: { toDate: string; targetUserId: string }) {
  const router = useRouter();
  const t = useTranslations('Today');
  const tMonths = useTranslations('Months');
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'yesterday' | 'specific'>('yesterday');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const yesterday = getYesterday(toDate);
  const specificDate = day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';
  const fromDate = mode === 'yesterday' ? yesterday : specificDate;

  return (
    <div className="border rounded max-w-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 text-sm font-medium flex justify-between items-center hover:bg-primary-light transition"
      >
        {t('copyFromAnotherDay')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 space-y-2">
          {error && <p className="text-red-600 text-xs">{error}</p>}
          {message && <p className="text-primary text-xs font-medium">{message}</p>}

          <select value={mode} onChange={(e) => setMode(e.target.value as 'yesterday' | 'specific')} className="border p-2 rounded w-full text-sm">
            <option value="yesterday">{t('yesterday', { date: formatDateDisplay(yesterday) })}</option>
            <option value="specific">{t('chooseSpecificDate')}</option>
          </select>

          {mode === 'specific' && (
            <div className="grid grid-cols-3 gap-2">
              <select value={day} onChange={(e) => setDay(e.target.value)} className="border p-2 rounded text-sm">
                <option value="" disabled>{t('day')}</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="border p-2 rounded text-sm">
                <option value="" disabled>{t('month')}</option>
                {MONTH_KEYS.map((m, i) => (
                  <option key={m} value={i + 1}>{tMonths(m)}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="border p-2 rounded text-sm">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

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
                setError(data.error ?? t('copyError'));
                return;
              }

              setMessage(t('copySuccess', { count: data.copied }));
              router.refresh();
            }}
            className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded text-sm w-full disabled:opacity-50 transition"
          >
            {loading ? t('copying') : t('copyEntries')}
          </button>
        </div>
      )}
    </div>
  );
}