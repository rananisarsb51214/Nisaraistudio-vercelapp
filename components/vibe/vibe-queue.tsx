'use client';

import React, { useState } from 'react';
import { 
  Database, RefreshCw, Play, Pause, Trash2, RotateCcw, CheckCircle2, Clock, AlertTriangle, Zap 
} from 'lucide-react';
import { ContentQueueJob } from '@/lib/vibe/types';

interface VibeQueueProps {
  jobs: ContentQueueJob[];
  onRefreshJobs: () => Promise<void>;
  onReprocessJob: (jobId: string) => Promise<void>;
  onCancelJob: (jobId: string) => Promise<void>;
}

export function VibeQueue({ jobs, onRefreshJobs, onReprocessJob, onCancelJob }: VibeQueueProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = jobs.filter(j => {
    if (filter === 'QUEUED') return j.status === 'QUEUED';
    if (filter === 'PROCESSING') return j.status === 'PROCESSING';
    if (filter === 'COMPLETED') return j.status === 'COMPLETED';
    if (filter === 'FAILED') return j.status === 'FAILED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#12141c] border border-slate-800/80 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
            <Database className="w-4 h-4" />
            <span>Redis Content Queue Layer (nisar:vibe:*)</span>
          </div>
          <h2 className="text-xl font-black text-white">Social Media Job Queue & State Worker</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Distributed asynchronous job queue using Redis for rate limiting, retry backoff, idempotency locks, and social reply publishing.
          </p>
        </div>

        <button
          onClick={onRefreshJobs}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center space-x-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        {['ALL', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filter === f ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#12141c] text-slate-400 hover:bg-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-[#12141c] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171a24] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Job ID</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Reply Payload</th>
                <th className="p-4">Status</th>
                <th className="p-4">Attempts</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-[#171a24]/50 transition">
                  <td className="p-4 font-bold text-emerald-400">{job.id}</td>
                  <td className="p-4 uppercase text-slate-200 font-bold">{job.platform}</td>
                  <td className="p-4 text-slate-300 font-sans line-clamp-1 max-w-xs">{job.replyText}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      job.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      job.status === 'PROCESSING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      job.status === 'FAILED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{job.attempts} / {job.maxAttempts}</td>
                  <td className="p-4 text-slate-500 text-[11px]">{new Date(job.createdAt).toLocaleTimeString()}</td>
                  <td className="p-4 text-right space-x-2">
                    {job.status === 'FAILED' && (
                      <button
                        onClick={() => onReprocessJob(job.id)}
                        className="px-2.5 py-1 bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800 text-[10px] rounded transition font-bold"
                      >
                        Re-Process
                      </button>
                    )}
                    {job.status === 'QUEUED' && (
                      <button
                        onClick={() => onCancelJob(job.id)}
                        className="px-2.5 py-1 bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800 text-[10px] rounded transition font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-mono">
                    No jobs found in queue matching the selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
