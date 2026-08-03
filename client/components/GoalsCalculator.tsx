'use client';

import { useState } from 'react';

interface CalculatedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export default function GoalsCalculator({
  onCalculate,
}: {
  onCalculate: (macros: CalculatedMacros) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goalType, setGoalType] = useState('maintain');

  function handleCalculate(e: React.SubmitEvent<HTMLFormElement>) {
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
        className="w-full text-left p-4 font-semibold flex justify-between items-center"
      >
        Calculate from your profile
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleCalculate} className="p-4 pt-0 space-y-3">
          <p className="text-xs text-gray-500">
            This is an estimate based on standard formulas, not personalised medical advice.
          </p>

          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="number"
            placeholder="Height (cm)"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="light">Light activity (1-3 days/week)</option>
            <option value="moderate">Moderate activity (3-5 days/week)</option>
            <option value="active">Very active (6-7 days/week)</option>
          </select>

          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Gain muscle</option>
          </select>

          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Calculate
          </button>
        </form>
      )}
    </div>
  );
}