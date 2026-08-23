'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', e.target.value);
        router.push(`/history?${params.toString()}`);
      }}
      className="border p-2 rounded"
    />
  );
}