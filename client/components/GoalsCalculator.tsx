'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CalculatedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
} 

export default function GoalsCalculator({ onCalculate }: { onCalculate: (macros: CalculatedMacros) => void }) {
  const t = useTranslations('Goals');
  const [isOpen, setIsOpen] = useState(false);
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goalType, setGoalType] = useState('maintain');
  const [knowBodyFat, setKnowBodyFat] = useState(false);
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [showBodyFatInfo, setShowBodyFatInfo] = useState(false);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();

    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);
    const ageNum = Number(age);

    let bmr: number;

    if (knowBodyFat && bodyFatPercent) {
      const bodyFatFraction = Number(bodyFatPercent) / 100;
      const leanMassKg = weightNum * (1 - bodyFatFraction);
      bmr = 370 + 21.6 * leanMassKg;
    } else {
      bmr =
        sex === 'male'
          ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
          : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };

    const proteinPerKgByActivity: Record<string, number> = {
      sedentary: 1.0,
      light: 1.2,
      moderate: 1.4,
      active: 1.6,
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    const goalAdjustments: Record<string, number> = {
      lose: -500,
      maintain: 0,
      gain: 300,
    };

    const calories = tdee + goalAdjustments[goalType];

    const proteinPerKg = proteinPerKgByActivity[activityLevel] + (goalType === 'gain' ? 0.2 : 0);
    const protein = weightNum * proteinPerKg;

    const fat = (calories * 0.25) / 9;
    const carbs = (calories - protein * 4 - fat * 9) / 4;
    const fibre = 30;

    onCalculate({
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fibre,
    });
  }

  return (
    <div className="border rounded mb-6 max-w-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 font-semibold flex justify-between items-center hover:bg-primary-light transition"
      >
        {t('calculateFromProfile')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleCalculate} className="p-4 pt-0 space-y-3">
          <p className="text-xs text-gray-500">{t('disclaimer')}</p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={knowBodyFat}
              onChange={(e) => setKnowBodyFat(e.target.checked)}
            />
            {t('knowBodyFat')}
          </label>

          {knowBodyFat && (
            <div>
              <input
                type="number"
                placeholder={t('bodyFatPercent')}
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                className="border p-2 rounded w-full"
                required
                min="1"
                max="70"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">{t('bodyFatHint')}</p>
              <button
                type="button"
                onClick={() => setShowBodyFatInfo(!showBodyFatInfo)}
                className="text-xs text-primary underline mt-1"
              >
                {t('howToEstimateBodyFat')}
              </button>

              {showBodyFatInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-2">
                  <p>{t('bodyFatMethodsIntro')}</p>
                  <div>
                    <p className="font-medium text-gray-800">{t('bodyFatMethodTapeTitle')}</p>
                    <p>{t('bodyFatMethodTapeText')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t('bodyFatMethodScaleTitle')}</p>
                    <p>{t('bodyFatMethodScaleText')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t('bodyFatMethodCalipersTitle')}</p>
                    <p>{t('bodyFatMethodCalipersText')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t('bodyFatMethodDexaTitle')}</p>
                    <p>{t('bodyFatMethodDexaText')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!knowBodyFat && (
            <select value={sex} onChange={(e) => setSex(e.target.value)} className="border p-2 rounded w-full">
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          )}

          {!knowBodyFat && (
            <input type="number" placeholder={t('age')} value={age} onChange={(e) => setAge(e.target.value)} className="border p-2 rounded w-full" required />
          )}

          <input type="number" placeholder={t('heightCm')} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="border p-2 rounded w-full" required={!knowBodyFat} />
          <input type="number" placeholder={t('weightKg')} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="border p-2 rounded w-full" required />

          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="border p-2 rounded w-full">
            <option value="sedentary">{t('sedentary')}</option>
            <option value="light">{t('light')}</option>
            <option value="moderate">{t('moderate')}</option>
            <option value="active">{t('active')}</option>
          </select>

          <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="border p-2 rounded w-full">
            <option value="lose">{t('lose')}</option>
            <option value="maintain">{t('maintain')}</option>
            <option value="gain">{t('gain')}</option>
          </select>

          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded transition">{t('calculate')}</button>
        </form>
      )}
    </div>
  );
}