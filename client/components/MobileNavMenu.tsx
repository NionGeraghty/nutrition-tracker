'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface User {
  id: string;
  email: string;
}

export default function MobileNavMenu({ user }: { user: User | null }) {
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
            Foods
          </Link>
          <Link href="/recipes" onClick={() => setIsOpen(false)}>
            Recipes
          </Link>
          <Link href="/today" onClick={() => setIsOpen(false)}>
            Today
          </Link>
          <Link href="/history" onClick={() => setIsOpen(false)}>
            History
          </Link>
          <Link href="/goals" onClick={() => setIsOpen(false)}>
            Goals
          </Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}