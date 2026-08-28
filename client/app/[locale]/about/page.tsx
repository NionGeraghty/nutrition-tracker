import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <main className="p-4 md:p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <p>{t('intro')}</p>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('goalsHeading')}</h2>
        <p>
          {t('goalsText1')} <strong>{t('goalsDisclaimer')}</strong>{t('goalsText2')}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('databaseHeading')}</h2>
        <p className="mb-2">{t('databaseText1')}</p>
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li>{t('databaseSearch')}</li>
          <li>{t('databaseBarcode')}</li>
        </ul>
        <p>
          {t('databaseText2')} <strong>{t('databaseDisclaimer')}</strong>{t('databaseText3')}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('recipesHeading')}</h2>
        <p>{t('recipesText')}</p>
    </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('loggingHeading')}</h2>
        <p className="mb-2">{t('loggingText')}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('loggingCopy')}</li>
          <li>{t('loggingShare')}</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('progressHeading')}</h2>
        <p>{t('progressText')}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">{t('installHeading')}</h2>
        <p className="mb-3">{t('installText')}</p>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm">{t('installAndroidTitle')}</p>
            <p className="text-sm text-gray-600">{t('installAndroidText')}</p>
          </div>
          <div>
            <p className="font-medium text-sm">{t('installIosTitle')}</p>
            <p className="text-sm text-gray-600">{t('installIosText')}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 pt-4 border-t">
        {t('closing')}{' '}
        <a href="mailto:geraghnb@tcd.ie" className="underline">
          geraghnb@tcd.ie
        </a>
        .
      </p>
    </main>
  );
}