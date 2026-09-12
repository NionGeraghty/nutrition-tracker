'use client';

import { useTranslations } from 'next-intl';
import { Summary } from '@/types';

function getPercentColor(percent: number): string {
  if (percent < 50 || percent >= 150) return 'text-red-600';
  if (percent < 90 || percent >= 111) return 'text-amber-600';
  return 'text-primary';
}

export default function SummaryCard({ summary }: { summary: Summary }) {
  const t = useTranslations('Today');

  const macros = [
    { label: t('cal'), unit: '', total: summary.totals.calories, goal: summary.goals?.calories, remaining: summary.remaining?.calories, decimals: 0 },
    { label: t('proteinUnit'), unit: 'g', total: summary.totals.protein, goal: summary.goals?.protein, remaining: summary.remaining?.protein, decimals: 1 },
    { label: t('carbsUnit'), unit: 'g', total: summary.totals.carbs, goal: summary.goals?.carbs, remaining: summary.remaining?.carbs, decimals: 1 },
    { label: t('fatUnit'), unit: 'g', total: summary.totals.fat, goal: summary.goals?.fat, remaining: summary.remaining?.fat, decimals: 1 },
    { label: t('fibreUnit'), unit: 'g', total: summary.totals.fibre, goal: summary.goals?.fibre, remaining: summary.remaining?.fibre, decimals: 1 },
  ];

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold text-base text-gray-900 mb-3">{t('summary')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {macros.map((macro) => {
          const percent = macro.goal ? Math.round((macro.total / macro.goal) * 100) : null;

          return (
            <div key={macro.label} className="text-center">
              <div className="text-xs font-medium text-gray-500 capitalize">{macro.label}</div>
              <div className="font-semibold text-gray-900">
                {macro.total.toFixed(macro.decimals)}{macro.unit}
              </div>
              {summary.goals && (
                <>
                  <div className="text-sm text-gray-500">
                    {macro.remaining!.toFixed(macro.decimals)}{macro.unit} {t('left')}
                  </div>
                  {percent !== null && (
                    <div className={`text-sm font-semibold ${getPercentColor(percent)}`}>
                      {percent}%
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {!summary.goals && <p className="text-sm text-gray-500 mt-2">{t('noGoalsSet')}</p>}
    </div>
  );
}