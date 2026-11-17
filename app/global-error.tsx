'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const handleTryAgain = () => {
    if (typeof reset === 'function') {
      try {
        reset();
      } catch {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-950 dark:bg-[#0d0f14] dark:text-slate-100 min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong!</h2>
          <p className="text-sm text-slate-700 dark:text-slate-400 mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={handleTryAgain}
            className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
