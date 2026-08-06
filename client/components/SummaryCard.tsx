import { Summary } from '@/types';

export default function SummaryCard({ summary }: { summary: Summary }) {
  const macros = [
    { label: 'Calories', total: summary.totals.calories, remaining: summary.remaining?.calories, decimals: 0 },
    { label: 'Protein', total: summary.totals.protein, remaining: summary.remaining?.protein, decimals: 1 },
    { label: 'Carbs', total: summary.totals.carbs, remaining: summary.remaining?.carbs, decimals: 1 },
    { label: 'Fat', total: summary.totals.fat, remaining: summary.remaining?.fat, decimals: 1 },
    { label: 'Fibre', total: summary.totals.fibre, remaining: summary.remaining?.fibre, decimals: 1 },
  ];

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-3">Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {macros.map((macro) => (
          <div key={macro.label} className="text-center">
            <div className="text-xs font-medium text-gray-500">{macro.label}</div>
            <div>{macro.total.toFixed(macro.decimals)}{macro.label !== 'Calories' ? 'g' : ''}</div>
            {summary.goals && (
              <div className="text-xs text-gray-500">
                {macro.remaining!.toFixed(macro.decimals)}{macro.label !== 'Calories' ? 'g' : ''} left
              </div>
            )}
          </div>
        ))}
      </div>
      {!summary.goals && (
        <p className="text-sm text-gray-500 mt-2">No goals set yet.</p>
      )}
    </div>
  );
}