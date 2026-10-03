export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold text-emerald-400 mb-4">404</h1>
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
      >
        Back to Dashboard
      </a>
    </div>
  );
}
