'use client';

import { useRouter } from '@/i18n/navigation'

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch(`/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm underline">
      Log out
    </button>
  );
}