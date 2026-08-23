import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';
import { Food, Entry, Summary, GrantedAccount } from '@/types';
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

async function getGrantedToMe(): Promise<GrantedAccount[]> {
  const response = await serverFetch('/editors/granted-to-me');
  return response.json();
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
  const [foods, entries, summary, grantedToMe] = await Promise.all([
    getFoods(),
    getEntries(date),
    getSummary(date),
    getGrantedToMe(),
  ]);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-1">Today — {date}</h1>
      <p className="text-sm text-gray-500">What you've eaten today, compared to your goals</p>

      <SummaryCard summary={summary} />

      <LogEntryForm foods={foods} date={date} userId={user.id} grantedToMe={grantedToMe} />

      <EntriesList entries={entries} foods={foods} />
    </main>
  );
}