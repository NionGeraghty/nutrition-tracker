import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/api';
import MobileNavMenu from './MobileNavMenu';
import LogoutButton from './LogoutButton';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Nav() {
  const user = await getCurrentUser();
  const t = await getTranslations('Nav');

  return (
    <nav className="border-b p-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="font-semibold text-primary">
          {t('appName')}
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/foods">{t('foods')}</Link>
          <Link href="/today">{t('today')}</Link>
          <Link href="/history">{t('history')}</Link>
          <Link href="/recipes">{t('recipes')}</Link>
          <Link href="/editors">{t('sharedUsers')}</Link>
          <Link href="/goals">{t('goals')}</Link>
          <Link href="/about">{t('about')}</Link>
          <div className="hidden md:flex items-center gap-6">
            {/* existing links */}
            <LanguageSwitcher />
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">{t('logIn')}</Link>
              <Link href="/signup">{t('signUp')}</Link>
            </div>
          )}
        </div>

        <div className="md:hidden">
          <MobileNavMenu user={user} />
        </div>
      </div>
    </nav>
  );
}