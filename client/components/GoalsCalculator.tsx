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

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();

    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);

    const bmr =
      sex === 'male'
        ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
        : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

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

          <select value={sex} onChange={(e) => setSex(e.target.value)} className="border p-2 rounded w-full">
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
          </select>

          <input type="number" placeholder={t('age')} value={age} onChange={(e) => setAge(e.target.value)} className="border p-2 rounded w-full" required />
          <input type="number" placeholder={t('heightCm')} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="border p-2 rounded w-full" required />
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