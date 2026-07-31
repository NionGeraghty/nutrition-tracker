import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';
import { Food, Entry, Summary } from '@/types';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getFoods(): Promise<Food[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foods`, { cache: 'no-store' });
  return response.json();
}

async function getEntries(date: string): Promise<Entry[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/entries?date=${date}`, {
    cache: 'no-store',
  });
  return response.json();
}

async function getSummary(date: string): Promise<Summary> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/summary?date=${date}`, {
    cache: 'no-store',
  });
  return response.json();
}

export default async function TodayPage() {
  const date = getTodayDateString();
  const [foods, entries, summary] = await Promise.all([
    getFoods(),
    getEntries(date),
    getSummary(date),
  ]);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Today — {date}</h1>

      <SummaryCard summary={summary} />

      <LogEntryForm foods={foods} date={date} />

      <EntriesList entries={entries} foods={foods} />
    </main>
  );
}