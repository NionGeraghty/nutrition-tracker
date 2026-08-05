import Link from 'next/link';
import { getCurrentUser } from '@/lib/api';
import LogoutButton from './LogoutButton';

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="border-b p-4 flex gap-6 items-center">
      <Link href="/" className="font-semibold">
        Macro Tracker
      </Link>
      <Link href="/foods">Foods</Link>
      <Link href="/today">Today</Link>
      <Link href="/history">History</Link>
      <Link href="/goals">Goals</Link>

      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}