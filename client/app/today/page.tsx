import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';
import { Food, Entry, Summary } from '@/types';
import { serverFetch } from '@/lib/api';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getFoods(): Promise<Food[]> {
  const response = await serverFetch('/foods', { cache: 'no-store' });
  return response.json();
}

async function getEntries(date: string): Promise<Entry[]> {
  const response = await serverFetch(`/entries?date=${date}`);
  return response.json();
}

async function getSummary(date: string): Promise<Summary> {
  const response = await serverFetch(`/summary?date=${date}`, { cache: 'no-store' });
  return response.json();
}

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/today');
  }

  const date = getTodayDateString();
  const [foods, entries, summary] = await Promise.all([
    getFoods(),
    getEntries(date),
    getSummary(date),
  ]);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-1">Today — {date}</h1>
      <p className="text-sm text-gray-500">What you've eaten today, compared to your goals</p>

      <SummaryCard summary={summary} />

      <LogEntryForm foods={foods} date={date} />

      <EntriesList entries={entries} foods={foods} />
    </main>
  );
}