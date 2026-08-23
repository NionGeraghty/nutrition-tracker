'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GrantedAccount } from '@/types';

interface ExternalFood {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fibrePer100g: number;
}

export default function CreateFoodForm({ grantedToMe, userId }: { grantedToMe: GrantedAccount[]; userId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');
  const [error, setError] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalFood[]>([]);
  const [searching, setSearching] = useState(false);

  function toggleTarget(id: string) {
  console.log('toggleTarget called with:', id);
  setSelectedTargets((prev) =>
    prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
  );
}

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

  function handleArrowNav(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    const form = e.currentTarget.form;
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(e.currentTarget);

    if (e.key === 'ArrowDown' && currentIndex < inputs.length - 1) {
      e.preventDefault();
      inputs[currentIndex + 1].focus();
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      inputs[currentIndex - 1].focus();
    }
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
                  targetUserIds: selectedTargets.length > 0 ? [userId, ...selectedTargets] : undefined,
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

            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleArrowNav}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calories per 100g</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  onKeyDown={handleArrowNav}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein per 100g</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  onKeyDown={handleArrowNav}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs per 100g</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  onKeyDown={handleArrowNav}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat per 100g</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  onKeyDown={handleArrowNav}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fibre per 100g</label>
                <input
                  type="number"
                  value={fibre}
                  onChange={(e) => setFibre(e.target.value)}
                  onKeyDown={handleArrowNav}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
            </div>

            {grantedToMe.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Also add to (in addition to your own account)
                </label>
                <div className="space-y-1">
                  {grantedToMe.map((account) => (
                <label key={account.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTargets.includes(account.owner_id)}
                    onChange={() => toggleTarget(account.owner_id)}
                  />
                  {account.email}
                </label>
              ))}
                </div>
              </div>
            )}

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