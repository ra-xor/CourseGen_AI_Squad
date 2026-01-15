import React, { useEffect, useRef } from 'react';
import { AgentLog, AgentRole } from '../types';
import { Bot, MessageSquare } from 'lucide-react';

interface LogStreamProps {
  logs: AgentLog[];
}

const LogStream: React.FC<LogStreamProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 fade-in">
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <Bot className="text-blue-400" size={18} />
                <span className="text-slate-200 font-mono text-sm font-medium">Agent Communication Channel</span>
                <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
            </div>
            <div ref={scrollRef} className="h-48 overflow-y-auto p-4 space-y-3 font-mono text-xs md:text-sm bg-slate-950/50">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                        <div className={`shrink-0 font-bold w-24 text-right
                            ${log.role === AgentRole.ORCHESTRATOR ? 'text-purple-400' : ''}
                            ${log.role === AgentRole.RESEARCHER ? 'text-blue-400' : ''}
                            ${log.role === AgentRole.JUDGE ? 'text-red-400' : ''}
                            ${log.role === AgentRole.WRITER ? 'text-green-400' : ''}
                        `}>
                            [{log.role}]
                        </div>
                        <div className={`flex-1 ${log.type === 'thinking' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                            {log.type === 'thinking' && <span className="animate-pulse mr-2">●</span>}
                            {log.message}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default LogStream;