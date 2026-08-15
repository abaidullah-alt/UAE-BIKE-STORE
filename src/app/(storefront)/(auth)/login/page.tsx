import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Welcome back</h1>
      <p className="text-sm text-slate-500 text-center mt-2">
        Log in to track orders, manage your wishlist, and check out faster.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="text-sm text-slate-500 text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-orange-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
