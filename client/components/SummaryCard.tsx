interface Summary {
  date: string;
  totals: { calories: number; protein: number; carbs: number; fat: number; fibre: number };
  goals: { calories: number; protein: number; carbs: number; fat: number; fibre: number } | null;
  remaining: { calories: number; protein: number; carbs: number; fat: number; fibre: number } | null;
}

export default function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-semibold mb-2">Summary</h2>
      <div className="grid grid-cols-5 gap-2 text-sm text-center">
        <div className="font-medium">Calories</div>
        <div className="font-medium">Protein</div>
        <div className="font-medium">Carbs</div>
        <div className="font-medium">Fat</div>
        <div className="font-medium">Fibre</div>

        <div>{summary.totals.calories.toFixed(0)}</div>
        <div>{summary.totals.protein.toFixed(1)}g</div>
        <div>{summary.totals.carbs.toFixed(1)}g</div>
        <div>{summary.totals.fat.toFixed(1)}g</div>
        <div>{summary.totals.fibre.toFixed(1)}g</div>
      </div>

      {summary.goals ? (
        <div className="grid grid-cols-5 gap-2 text-sm text-center mt-2 text-gray-600">
          <div>{summary.remaining!.calories.toFixed(0)} left</div>
          <div>{summary.remaining!.protein.toFixed(1)}g left</div>
          <div>{summary.remaining!.carbs.toFixed(1)}g left</div>
          <div>{summary.remaining!.fat.toFixed(1)}g left</div>
          <div>{summary.remaining!.fibre.toFixed(1)}g left</div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No goals set yet.</p>
      )}
    </div>
  );
}