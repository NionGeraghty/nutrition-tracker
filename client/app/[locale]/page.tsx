import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/api';

export default async function Home() {
  const t = await getTranslations('Home');
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">{t('heroTitle')}</h1>
          <p className="text-lg text-gray-600">{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded font-medium transition">
              {t('signUp')}
            </Link>
            <Link href="/login" className="border border-gray-300 px-6 py-3 rounded font-medium">
              {t('logIn')}
            </Link>
          </div>
          <p>
            <Link href="/about" className="text-sm text-gray-500 underline">
              {t('learnMore')}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const cards = [
    { href: '/foods', title: t('foodsTitle'), desc: t('foodsDesc') },
    { href: '/today', title: t('todayTitle'), desc: t('todayDesc') },
    { href: '/history', title: t('historyTitle'), desc: t('historyDesc') },
    { href: '/recipes', title: t('recipesTitle'), desc: t('recipesDesc') },
    { href: '/editors', title: t('sharedUsersTitle'), desc: t('sharedUsersDesc') },
    { href: '/goals', title: t('goalsTitle'), desc: t('goalsDesc') },
  ];

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">
        {t('welcomeBack')}, {user.email}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-gray-200 rounded-lg p-5 hover:border-primary hover:bg-primary-light transition"
          >
            <h2 className="font-semibold mb-1">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}