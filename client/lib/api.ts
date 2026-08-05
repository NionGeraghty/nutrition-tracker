import { cookies } from 'next/headers';

export async function serverFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });
}