import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold text-white">
          Verify your email
        </h1>

        <p className="mt-4 text-slate-400">
          We've sent a verification link to your email address.
        </p>

        <p className="mt-2 text-slate-400">
          Click the link in your inbox to activate your SmartPulse account.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/login"
            className="block rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-500"
          >
            I've already verified my email
          </Link>

          <button
            className="w-full rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </main>
  );
}