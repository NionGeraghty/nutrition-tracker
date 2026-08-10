import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';
import DatePicker from '@/components/DatePicker';
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
  const response = await serverFetch('/foods');
  return response.json();
}

async function getEntries(date: string): Promise<Entry[]> {
  const response = await serverFetch(`/entries?date=${date}`);
  return response.json();
}

async function getSummary(date: string): Promise<Summary> {
  const response = await serverFetch(`/summary?date=${date}`);
  return response.json();
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/history');
  }
  const date = params.date ?? getTodayDateString();

  const [foods, entries, summary] = await Promise.all([
    getFoods(),
    getEntries(date),
    getSummary(date),
  ]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">History</h1>

      <DatePicker date={date} />

      <SummaryCard summary={summary} />

      <LogEntryForm foods={foods} date={date} />

      <EntriesList entries={entries} foods={foods} />
    </main>
  );
}