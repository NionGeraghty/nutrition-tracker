'use client';

import { useTranslations } from 'next-intl';
import { Summary } from '@/types';

export default function SummaryCard({ summary }: { summary: Summary }) {
  const t = useTranslations('Today');

  const macros = [
    { label: t('cal'), unit: '', total: summary.totals.calories, remaining: summary.remaining?.calories, decimals: 0 },
    { label: t('proteinUnit'), unit: 'g', total: summary.totals.protein, remaining: summary.remaining?.protein, decimals: 1 },
    { label: t('carbsUnit'), unit: 'g', total: summary.totals.carbs, remaining: summary.remaining?.carbs, decimals: 1 },
    { label: t('fatUnit'), unit: 'g', total: summary.totals.fat, remaining: summary.remaining?.fat, decimals: 1 },
    { label: t('fibreUnit'), unit: 'g', total: summary.totals.fibre, remaining: summary.remaining?.fibre, decimals: 1 },
  ];

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3">{t('summary')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {macros.map((macro) => (
          <div key={macro.label} className="text-center">
            <div className="text-xs font-medium text-gray-500 capitalize">{macro.label}</div>
            <div>{macro.total.toFixed(macro.decimals)}{macro.unit}</div>
            {summary.goals && (
              <div className="text-xs text-gray-500">
                {macro.remaining!.toFixed(macro.decimals)}{macro.unit} {t('left')}
              </div>
            )}
          </div>
        ))}
      </div>
      {!summary.goals && <p className="text-sm text-gray-500 mt-2">{t('noGoalsSet')}</p>}
    </div>
  );
}