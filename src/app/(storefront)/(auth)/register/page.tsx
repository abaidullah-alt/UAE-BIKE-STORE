import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Create your account</h1>
      <p className="text-sm text-slate-500 text-center mt-2">
        Join UAE Bicycle to track orders and check out faster.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-orange-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
