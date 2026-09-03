'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import LogoutButton from './LogoutButton';
import LanguageSwitcher from './LanguageSwitcher';

interface User {
  id: string;
  email: string;
}

export default function MobileNavMenu({ user }: { user: User | null }) {
  const t = useTranslations('Nav');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl"
        aria-label="Toggle menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 bg-white border-b p-4 flex flex-col gap-3 z-10">
          <Link href="/foods" onClick={() => setIsOpen(false)}>
            {t('foods')}
          </Link>
          <Link href="/recipes" onClick={() => setIsOpen(false)}>
            {t('recipes')}
          </Link>
          <Link href="/today" onClick={() => setIsOpen(false)}>
            {t('today')}
          </Link>
          <Link href="/history" onClick={() => setIsOpen(false)}>
            {t('history')}
          </Link>
          <Link href="/goals" onClick={() => setIsOpen(false)}>
            {t('goals')}
          </Link>
          <Link href="/editors" onClick={() => setIsOpen(false)}>
            {t('sharedUsers')}
          </Link>
          <Link href="/about">{t('about')}</Link>
          <LanguageSwitcher />
          {user ? (
            <>
              <span className="text-sm text-gray-500">{user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                {t('logIn')}
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                {t('signUp')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}