'use client';

import { loginWithGoogle } from './auth-provider';
import { Globe } from 'lucide-react';

export function Login() {
  return (
    <button 
      onClick={() => loginWithGoogle()} 
      className="w-full flex items-center justify-center space-x-3 bg-[#1e2230] hover:bg-[#272b3c] text-slate-100 hover:text-white font-bold py-3 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition duration-200 active:scale-[0.98] shadow-lg font-sans text-sm"
    >
      <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
      <span>Continue with Google</span>
    </button>
  );
}
