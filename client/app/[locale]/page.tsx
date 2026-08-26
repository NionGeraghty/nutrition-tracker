import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-600">{t('subtitle')}</p>
    </main>
  );
}