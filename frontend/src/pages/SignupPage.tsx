import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Create an account to get started
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
