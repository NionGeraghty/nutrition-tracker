import Link from 'next/link';
import { getCurrentUser } from '@/lib/api';
import MobileNavMenu from './MobileNavMenu';
import LogoutButton from './LogoutButton';

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <nav className="border-b p-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="font-semibold">
          Macro Tracker
        </Link>

        {/* Desktop nav — hidden on mobile, shown from md breakpoint up */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/foods">Foods</Link>
          <Link href="/today">Today</Link>
          <Link href="/history">History</Link>
          <Link href="/goals">Goals</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle — hidden from md breakpoint up */}
        <div className="md:hidden">
          <MobileNavMenu user={user} />
        </div>
      </div>
    </nav>
  );
}