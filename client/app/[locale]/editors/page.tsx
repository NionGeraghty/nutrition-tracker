import { redirect } from 'next/navigation';
import { getCurrentUser, serverFetch } from '@/lib/api';
import EditorsManager from '@/components/EditorsManager';

interface EditorRelation {
  id: string;
  email: string;
}

interface UnreciprocatedRelation {
  id: string;
  email: string;
}

async function getMyEditors(): Promise<EditorRelation[]> {
  const response = await serverFetch('/editors/mine');
  return response.json();
}

async function getGrantedToMe(): Promise<EditorRelation[]> {
  const response = await serverFetch('/editors/granted-to-me');
  return response.json();
}

async function getUnreciprocated(): Promise<UnreciprocatedRelation[]> {
  const response = await serverFetch('/editors/unreciprocated');
  return response.json();
}

export default async function EditorsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/editors');
  }

  const [myEditors, grantedToMe, unreciprocated] = await Promise.all([
    getMyEditors(),
    getGrantedToMe(),
    getUnreciprocated(),
  ]);

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Sharing</h1>
        <p className="text-sm text-gray-500">
          Give people permission to add foods, recipes, and entries to your account
        </p>
      </div>

      <EditorsManager
        myEditors={myEditors}
        grantedToMe={grantedToMe}
        unreciprocated={unreciprocated}
      />
    </main>
  );
}