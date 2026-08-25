import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import { Food, Entry, Summary, GrantedAccount } from '@/types';
import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';
import DatePicker from '@/components/DatePicker';
import ViewingSelector from '@/components/ViewingSelector';
import CopyDayButton from '@/components/CopyDayButton';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getFoods(forUserId: string): Promise<Food[]> {
  const response = await serverFetch(`/foods?forUserId=${forUserId}`);
  return response.json();
}

async function getEntries(date: string, forUserId: string): Promise<Entry[]> {
  const response = await serverFetch(`/entries?date=${date}&forUserId=${forUserId}`);
  return response.json();
}

async function getSummary(date: string, forUserId: string): Promise<Summary> {
  const response = await serverFetch(`/summary?date=${date}&forUserId=${forUserId}`);
  return response.json();
}

async function getGrantedToMe(): Promise<GrantedAccount[]> {
  const response = await serverFetch('/editors/granted-to-me');
  return response.json();
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; viewing?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/history');
  }

  const params = await searchParams;
  const date = params.date ?? getTodayDateString();
  const viewing = params.viewing || user.id;

  const [foods, entries, summary, grantedToMe] = await Promise.all([
    getFoods(viewing),
    getEntries(date, viewing),
    getSummary(date, viewing),
    getGrantedToMe(),
  ]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">History</h1>

      <div className="flex flex-wrap gap-4">
        <DatePicker date={date} />
        <ViewingSelector userId={user.id} userEmail={user.email} grantedToMe={grantedToMe} basePath="/history" />
      </div>

      <CopyDayButton toDate={date} targetUserId={viewing} />

      <SummaryCard summary={summary} />

      <LogEntryForm foods={foods} date={date} targetUserId={viewing} />

      <EntriesList entries={entries} foods={foods} targetUserId={viewing} />
    </main>
  );
}