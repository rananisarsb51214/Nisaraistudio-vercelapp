'use client';

export default function ErrorPage({
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
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-red-400 mb-2">Application Error</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">{error?.message || 'Something went wrong.'}</p>
      <button
        onClick={handleTryAgain}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
