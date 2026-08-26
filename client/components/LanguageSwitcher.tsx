'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function switchTo(newLocale: string) {
    // pathname already excludes the current locale prefix in next-intl's routing
    const target = newLocale === 'en' ? pathname : `/es${pathname}`;
    router.push(target);
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