'use client';

import { loginWithGoogle } from './auth-provider';
import { Globe } from 'lucide-react';

export function Login() {
  return (
    <button 
      onClick={() => loginWithGoogle()} 
      className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#1e2230] dark:hover:bg-[#272b3c] dark:text-slate-100 dark:hover:text-white font-bold py-3 px-4 rounded-xl border border-slate-950 dark:border-slate-700 dark:hover:border-slate-600 transition duration-200 active:scale-[0.98] shadow-lg font-sans text-sm cursor-pointer"
    >
      <Globe className="w-4 h-4 text-emerald-400" />
      <span>Continue with Google</span>
    </button>
  );
}
