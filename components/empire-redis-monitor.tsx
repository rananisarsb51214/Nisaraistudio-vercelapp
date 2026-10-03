'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, Cpu, Lock, Play, RefreshCw, CheckCircle2, AlertCircle, 
  Clock, ShieldCheck, Layers, Bot, Zap, ArrowRight, Activity, Terminal
} from 'lucide-react';

export function EmpireRedisMonitor() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMissionTitle, setNewMissionTitle] = useState('Build Microservice Deployment Pipeline');
  const [newMissionGoal, setNewMissionGoal] = useState('Deploy containerized microservices with QA and security audits via Redis orchestrator.');
  const [isExecuting, setIsExecuting] = useState(false);

  const fetchRedisData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/empire');
      if (!res.ok) throw new Error('Failed to fetch Redis execution data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error communicating with Redis engine');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedisData();
    const interval = setInterval(fetchRedisData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMission = async () => {
    if (!newMissionTitle) return;
    try {
      setIsExecuting(true);
      const res = await fetch('/api/empire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_and_execute',
          title: newMissionTitle,
          goal: newMissionGoal
        })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await fetchRedisData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReleaseLock = async (missionId: string) => {
    try {
      await fetch('/api/empire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release_lock',
          missionId
        })
      });
      await fetchRedisData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#161224] via-[#12141c] to-[#0d1624] border border-rose-500/30 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-[10px] uppercase font-bold rounded border border-rose-500/30 flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>Redis Distributed Engine</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {data?.redisMode || 'Connecting to Redis...'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1 flex items-center space-x-2">
              <span>Empire OS Core Execution Layer</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Distributed state coordinator utilizing Redis keys (<code className="text-rose-300 font-mono">empire:mission</code>, <code className="text-rose-300 font-mono">empire:agent</code>, <code className="text-rose-300 font-mono">empire:lock</code>), BullMQ job queues, and atomic Lua locks for multi-agent execution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchRedisData}
              disabled={loading}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync State</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Empire Architecture Visualizer */}
      <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Redis Runtime Architecture Topology</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Atomic Synchronization Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-[#181b28] border border-slate-700 rounded-lg flex flex-col items-center justify-center space-y-1">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-200">Mission State</span>
            <span className="text-[10px] text-slate-400 font-mono">empire:mission:*</span>
          </div>

          <div className="p-3 bg-[#181b28] border border-slate-700 rounded-lg flex flex-col items-center justify-center space-y-1">
            <Bot className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-slate-200">Agent State</span>
            <span className="text-[10px] text-slate-400 font-mono">empire:agent:*</span>
          </div>

          <div className="p-3 bg-[#181b28] border border-slate-700 rounded-lg flex flex-col items-center justify-center space-y-1">
            <Lock className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-slate-200">Distributed Lock</span>
            <span className="text-[10px] text-slate-400 font-mono">SET NX EX + Lua</span>
          </div>

          <div className="p-3 bg-[#181b28] border border-slate-700 rounded-lg flex flex-col items-center justify-center space-y-1">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-slate-200">Job Queue</span>
            <span className="text-[10px] text-slate-400 font-mono">empire:queue:jobs</span>
          </div>

          <div className="p-3 bg-[#181b28] border border-slate-700 rounded-lg flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-slate-200">Validator & Agents</span>
            <span className="text-[10px] text-slate-400 font-mono">4 Specialized Workers</span>
          </div>
        </div>
      </div>

      {/* Trigger Mission Control */}
      <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Dispatch New Empire OS Mission</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Mission Title</label>
            <input
              type="text"
              value={newMissionTitle}
              onChange={(e) => setNewMissionTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#171a24] border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Mission Operational Goal</label>
            <input
              type="text"
              value={newMissionGoal}
              onChange={(e) => setNewMissionGoal(e.target.value)}
              className="w-full px-3 py-2 bg-[#171a24] border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          onClick={handleStartMission}
          disabled={isExecuting || !newMissionTitle}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-rose-950/40"
        >
          {isExecuting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 fill-white" />
          )}
          <span>{isExecuting ? 'Dispatching Mission...' : 'Execute Mission via Redis Engine'}</span>
        </button>
      </div>

      {/* Active Mission Runtime States */}
      <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Active Mission States (<code className="text-rose-400">empire:mission:*</code>)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {data?.missions?.length || 0} Registered
          </span>
        </div>

        {!data?.missions || data.missions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No active missions in Redis state store. Dispatch a mission above.
          </div>
        ) : (
          <div className="space-y-4">
            {data.missions.map((mission: any) => {
              const isLocked = !!data?.locks?.[mission.missionId];
              return (
                <div key={mission.missionId} className="p-4 bg-[#171a24] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-slate-400">{mission.missionId}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                          mission.state === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          mission.state === 'executing' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' :
                          mission.state === 'failed' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {mission.state}
                        </span>
                        {isLocked && (
                          <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Lock: {data.locks[mission.missionId]}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-100 mt-1">{mission.title}</h4>
                      <p className="text-xs text-slate-400">{mission.goal}</p>
                    </div>

                    {isLocked && (
                      <button
                        onClick={() => handleReleaseLock(mission.missionId)}
                        className="px-2.5 py-1 bg-amber-950/40 text-amber-300 border border-amber-800 hover:bg-amber-900/50 rounded text-xs transition self-start font-mono"
                      >
                        Release Lock
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Step: {mission.currentStep || 'Initializing'}</span>
                      <span>Agent: {mission.currentAgent || 'Pending'}</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-500 transition-all duration-300" 
                        style={{ width: `${mission.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agents & Queue State Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent States */}
        <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Agent States (<code className="text-purple-300">empire:agent:*</code>)</span>
          </h3>

          {!data?.agents || data.agents.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No registered active agents.
            </div>
          ) : (
            <div className="space-y-2">
              {data.agents.map((agent: any) => (
                <div key={agent.agentId} className="p-3 bg-[#171a24] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{agent.agentRole || 'Agent'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{agent.agentId}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{agent.currentTask || 'Idle'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    agent.state === 'running' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    agent.state === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distributed Job Queue Stats */}
        <div className="p-6 bg-[#12141c] border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Job Queue (<code className="text-cyan-300">empire:queue:jobs</code>)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 bg-[#171a24] border border-slate-800 rounded-lg">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {data?.queueStats?.queued || 0}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-mono mt-1">Queued Jobs</p>
            </div>
            <div className="p-4 bg-[#171a24] border border-slate-800 rounded-lg">
              <span className="text-2xl font-black text-rose-400 font-mono">
                {data?.queueStats?.active || 0}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-mono mt-1">Active Workers</p>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-400 mb-2 font-mono">Recent Enqueued Jobs</h4>
            {!data?.recentJobs || data.recentJobs.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono">Queue buffer empty.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {data.recentJobs.slice(0, 5).map((job: any) => (
                  <div key={job.id} className="p-2 bg-[#181b28] border border-slate-800 rounded text-[11px] flex items-center justify-between">
                    <span className="font-mono text-slate-300 truncate max-w-[180px]">{job.name}</span>
                    <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
