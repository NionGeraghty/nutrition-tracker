'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function switchTo(newLocale: string) {
    router.push(pathname, { locale: newLocale });
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