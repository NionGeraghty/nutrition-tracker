'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExternalFood {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g: number;
}

export default function CreateFoodForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalFood[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (searchQuery.trim().length === 0) return;

    setSearching(true);
    const response = await fetch(`/api/foods/search-external?q=${encodeURIComponent(searchQuery)}`, {
      credentials: 'include',
    });
    const results = await response.json();
    setSearchResults(response.ok ? results : []);
    setSearching(false);
  }

  function applyResult(result: ExternalFood) {
    setName(result.name);
    setCalories(String(result.caloriesPer100g));
    setProtein(String(result.proteinPer100g));
    setCarbs(String(result.carbsPer100g));
    setFat(String(result.fatPer100g));
    setFibre(String(result.fibrePer100g));
    setSearchResults([]);
    setSearchQuery('');
  }

  return (
    <div className="border rounded mb-6 max-w-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 font-semibold flex justify-between items-center"
      >
        Add a food
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Search a nutrition database (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. chicken breast"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="border p-2 rounded flex-1"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="border px-3 py-2 rounded text-sm"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <ul className="border rounded max-h-48 overflow-y-auto divide-y">
                {searchResults.map((result, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => applyResult(result)}
                      className="w-full text-left p-2 text-sm hover:bg-gray-50"
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-gray-500">
                        {result.caloriesPer100g} cal · {result.proteinPer100g}g protein per 100g
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');

              const response = await fetch('/api/foods', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  caloriesPer100g: Number(calories),
                  proteinPer100g: Number(protein),
                  carbsPer100g: Number(carbs),
                  fatPer100g: Number(fat),
                  fibrePer100g: Number(fibre),
                }),
              });

              if (!response.ok) {
                setError('Failed to create food. Check your values and try again.');
                return;
              }

              setName('');
              setCalories('');
              setProtein('');
              setCarbs('');
              setFat('');
              setFibre('');

              router.refresh();
            }}
            className="space-y-3"
          >
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Calories per 100g"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Protein per 100g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Carbs per 100g"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Fat per 100g"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Fibre per 100g"
                value={fibre}
                onChange={(e) => setFibre(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                Add food
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}