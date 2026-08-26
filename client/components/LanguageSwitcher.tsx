'use client';

import { useRouter } from '@/i18n/navigation'
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales } from '@/i18n/config';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function switchTo(newLocale: string) {
    const segments = pathname.split('/');
    const firstSegment = segments[1];

    const pathWithoutLocale = locales.includes(firstSegment as any)
      ? '/' + segments.slice(2).join('/')
      : pathname;

    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  return (
    <select
      value={locale}
      onChange={(e) => switchTo(e.target.value)}
      className="border rounded text-sm p-1"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}