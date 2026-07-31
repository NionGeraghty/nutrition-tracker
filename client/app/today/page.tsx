import LogEntryForm from '@/components/LogEntryForm';
import EntriesList from '@/components/EntriesList';
import SummaryCard from '@/components/SummaryCard';

interface Food {
  id: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

interface Entry {
  id: string;
  date: string;
  grams: string;
  meal_type: string;
  name: string;
  calories_per_100g: string;
  protein_per_100g: string;
  carbs_per_100g: string;
  fat_per_100g: string;
  fibre_per_100g: string;
}

interface Summary {
  date: string;
  totals: { calories: number; protein: number; carbs: number; fat: number; fibre: number };
  goals: { calories: number; protein: number; carbs: number; fat: number; fibre: number } | null;
  remaining: { calories: number; protein: number; carbs: number; fat: number; fibre: number } | null;
}

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

      <EntriesList entries={entries} />
    </main>
  );
}