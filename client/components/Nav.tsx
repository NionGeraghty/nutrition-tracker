import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="border-b p-4 flex gap-6">
      <Link href="/" className="font-semibold">
        Macro Tracker
      </Link>
      <Link href="/foods">Foods</Link>
      <Link href="/today">Today</Link>
      <Link href="/history">History</Link>
      <Link href="/goals">Goals</Link>
    </nav>
  );
}