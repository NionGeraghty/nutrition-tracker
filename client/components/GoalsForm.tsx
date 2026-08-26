'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Goals } from '@/types';
import GoalsCalculator from './GoalsCalculator';
import ExplanationSection from './ExplanationSection';

export default function GoalsForm({ goals }: { goals: Goals | null }) {
  const router = useRouter();
  const t = useTranslations('Goals');
  const [calories, setCalories] = useState(goals?.calories ?? '');
  const [protein, setProtein] = useState(goals?.protein ?? '');
  const [carbs, setCarbs] = useState(goals?.carbs ?? '');
  const [fat, setFat] = useState(goals?.fat ?? '');
  const [fibre, setFibre] = useState(goals?.fibre ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function handleCalculated(macros: { calories: number; protein: number; carbs: number; fat: number; fibre: number }) {
    setCalories(String(macros.calories));
    setProtein(String(macros.protein));
    setCarbs(String(macros.carbs));
    setFat(String(macros.fat));
    setFibre(String(macros.fibre));
  }

  return (
    <>
      <GoalsCalculator onCalculate={handleCalculated} />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setSaved(false);

          const response = await fetch('/api/goals', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              calories: Number(calories),
              protein: Number(protein),
              carbs: Number(carbs),
              fat: Number(fat),
              fibre: Number(fibre),
            }),
          });

          if (!response.ok) {
            setError(t('saveError'));
            return;
          }

          setSaved(true);
          router.refresh();
        }}
        className="border p-4 rounded space-y-3 max-w-md"
      >
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-600 text-sm">{t('saved')}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">{t('calories')}</label>
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('protein')}</label>
          <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('carbs')}</label>
          <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('fat')}</label>
          <input type="number" value={fat} onChange={(e) => setFat(e.target.value)} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('fibre')}</label>
          <input type="number" value={fibre} onChange={(e) => setFibre(e.target.value)} className="border p-2 rounded w-full" required />
        </div>

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">{t('save')}</button>
      </form>

      <div className="mt-4 max-w-md space-y-3">
        <p className="text-xs text-gray-500">
          <strong>{t('medicalDisclaimer')}</strong>
        </p>
        <ExplanationSection />
      </div>
    </>
  );
}