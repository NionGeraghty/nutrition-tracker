import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>
      <LoginForm />
    </main>
  );
}