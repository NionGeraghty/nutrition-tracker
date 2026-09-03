'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ExplanationSection() {
  const t = useTranslations('Goals');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 font-semibold text-base text-gray-900 flex justify-between items-center"
      >
        {t('howCalculated')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 space-y-3">
          <div>
            <p className="font-semibold text-gray-900">{t('explainCaloriesTitle')}</p>
            <p className="text-sm text-gray-500">{t('explainCalories')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('explainProteinTitle')}</p>
            <p className="text-sm text-gray-500">{t('explainProtein')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('explainFatCarbsTitle')}</p>
            <p className="text-sm text-gray-500">{t('explainFatCarbs')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('explainFibreTitle')}</p>
            <p className="text-sm text-gray-500">{t('explainFibre')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{t('explainWhyTitle')}</p>
            <p className="text-sm text-gray-500">{t('explainWhy')}</p>
          </div>
        </div>
      )}
    </div>
  );
}