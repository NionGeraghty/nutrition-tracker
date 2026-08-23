'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GrantedAccount } from '@/types';

export default function ViewingSelector({
  userId,
  userEmail,
  grantedToMe,
  basePath,
}: {
  userId: string;
  userEmail: string;
  grantedToMe: GrantedAccount[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewing = searchParams.get('viewing') || userId;

  if (grantedToMe.length === 0) {
    return null;
  }

  function handleChange(newViewing: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newViewing === userId) {
      params.delete('viewing');
    } else {
      params.set('viewing', newViewing);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">Viewing</label>
      <select
        value={viewing}
        onChange={(e) => handleChange(e.target.value)}
        className="border p-2 rounded"
      >
        <option value={userId}>Me ({userEmail})</option>
        {grantedToMe.map((account) => (
          <option key={account.id} value={account.owner_id}>
            {account.email}
          </option>
        ))}
      </select>
    </div>
  );
}