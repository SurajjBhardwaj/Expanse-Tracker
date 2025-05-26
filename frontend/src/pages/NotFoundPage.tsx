import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center flex-col">
      <h1 className="text-4xl font-bold">404: Page Not Found</h1>
      <p className="mt-4 text-lg">
        The page you are looking for does not exist.
      </p>
      <Link to="/login" className="mt-6 text-blue-500 underline">
        Go back to Login
      </Link>
    </div>
  );
}

export default NotFoundPage;
