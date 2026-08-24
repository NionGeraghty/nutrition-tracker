'use client';

import { useState } from 'react';

export default function ExplanationSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 text-xs font-medium flex justify-between items-center"
      >
        How are these numbers calculated?
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 text-xs text-gray-600 space-y-3">
          <div>
            <p className="font-medium text-gray-800">Calories</p>
            <p>
              We estimate your resting metabolic rate using the Mifflin-St Jeor
              equation, a widely used formula based on your height, weight, age,
              and sex. We then multiply it by an activity factor based on how
              active you told us you are, and adjust up or down depending on
              whether your goal is to lose, maintain, or gain weight.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800">Protein</p>
            <p>
              Protein targets are based on published nutrition research
              recommending higher protein intake per kilogram of body weight
              for people who are more physically active, with a small
              additional allowance if your goal is to build muscle.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800">Fat and carbs</p>
            <p>
              Fat is set at roughly a quarter of your total calories. Carbs
              make up whatever calories are left once protein and fat are
              accounted for.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800">Fibre</p>
            <p>A general daily fibre target, not personalised to your other numbers.</p>
          </div>

          <div>
            <p className="font-medium text-gray-800">Why this won't be exact</p>
            <p>
              These formulas are based on averages across large groups of
              people. Your actual needs depend on things they can't measure —
              body composition, genetics, health conditions, and more. Two
              people with identical height, weight, and age can have
              genuinely different real-world energy needs. Use these numbers
              as an informed starting point, not a guarantee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}