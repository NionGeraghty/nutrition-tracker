'use client';

import { useRouter } from 'next/navigation';

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => router.push(`/history?date=${e.target.value}`)}
      className="border p-2 rounded"
    />
  );
}