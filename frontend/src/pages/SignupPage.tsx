import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8 text-center border rounded-xl p-10 bg-white dark:bg-gray-800 shadow-lg">
        <p className="text-muted-foreground mt-2">
          Create an account to get started
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
