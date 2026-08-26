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
        className="w-full text-left p-3 text-xs font-medium flex justify-between items-center"
      >
        {t('howCalculated')}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="p-3 pt-0 text-xs text-gray-600 space-y-3">
          <div>
            <p className="font-medium text-gray-800">{t('explainCaloriesTitle')}</p>
            <p>{t('explainCalories')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">{t('explainProteinTitle')}</p>
            <p>{t('explainProtein')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">{t('explainFatCarbsTitle')}</p>
            <p>{t('explainFatCarbs')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">{t('explainFibreTitle')}</p>
            <p>{t('explainFibre')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">{t('explainWhyTitle')}</p>
            <p>{t('explainWhy')}</p>
          </div>
        </div>
      )}
    </div>
  );
}