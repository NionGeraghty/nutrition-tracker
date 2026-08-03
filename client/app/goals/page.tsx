import GoalsForm from '@/components/GoalsForm';
import { Goals } from '@/types';

async function getGoals(): Promise<Goals | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  return response.json();
}

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Goals</h1>
      <GoalsForm goals={goals} />
    </main>
  );
}