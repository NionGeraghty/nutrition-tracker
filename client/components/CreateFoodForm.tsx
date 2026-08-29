'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl';
import { GrantedAccount } from '@/types';
import BarcodeScanner from './BarcodeScanner';

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
  const t = useTranslations('Foods');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');
  const [error, setError] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [portionGrams, setPortionGrams] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);

  function toggleTarget(id: string) {
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
        {t('addFood')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('searchLabel')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
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
                {searching ? t('searching') : t('search')}
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
                        {result.caloriesPer100g} {t('cal')} · {result.proteinPer100g}g {t('proteinUnit')} per 100g
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => setScanning(true)}
            className="border px-3 py-2 rounded text-sm"
          >
            {t('scanBarcode')}
          </button>

          {scanning && (
            <BarcodeScanner
              onDetected={async (code) => {
                setScanning(false);
                const response = await fetch(`/api/foods/barcode/${code}`, { credentials: 'include' });
                if (response.ok) {
                  const result = await response.json();
                  setName(result.name);
                  setCalories(String(result.caloriesPer100g));
                  setProtein(String(result.proteinPer100g));
                  setCarbs(String(result.carbsPer100g));
                  setFat(String(result.fatPer100g));
                  setFibre(String(result.fibrePer100g));
                } else {
                  setError('No product found for that barcode.');
                }
              }}
              onClose={() => setScanning(false)}
            />
          )}

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
                  portionGrams: portionGrams ? Number(portionGrams) : undefined,
                  targetUserIds: selectedTargets.length > 0 ? [userId, ...selectedTargets] : undefined,
                }),
              });

              if (!response.ok) {
                setError(t('createError'));
                return;
              }

              setName('');
              setCalories('');
              setProtein('');
              setCarbs('');
              setFat('');
              setFibre('');
              setPortionGrams('');

              router.refresh();
            }}
            className="space-y-3"
          >
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('name')}</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('caloriesPer100g')}</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('proteinPer100g')}</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('carbsPer100g')}</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('fatPer100g')}</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('fibrePer100g')}</label>
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
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('portionGrams')}</label>
              <input
                type="number"
                value={portionGrams}
                onChange={(e) => setPortionGrams(e.target.value)}
                onKeyDown={handleArrowNav}
                className="border p-2 rounded w-full"
                placeholder={t('portionHint')}
              />
            </div>

            {grantedToMe.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('alsoAddTo')}</label>
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
                {t('submit')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}