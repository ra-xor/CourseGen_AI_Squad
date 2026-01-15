import React from 'react';
import { AgentRole, AppStatus } from '../types';
import { Brain, Search, Gavel, PenTool, Loader2 } from 'lucide-react';

interface AgentStatusProps {
  status: AppStatus;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ status }) => {
  const getAgentStyle = (role: AgentRole, activeStatus: AppStatus) => {
    const isActive = 
      (role === AgentRole.RESEARCHER && activeStatus === AppStatus.RESEARCHING) ||
      (role === AgentRole.JUDGE && activeStatus === AppStatus.JUDGING) ||
      (role === AgentRole.WRITER && activeStatus === AppStatus.WRITING);

    const baseClasses = "flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-500 border-2";
    const activeClasses = "bg-white border-blue-500 shadow-xl scale-110 z-10";
    const inactiveClasses = "bg-gray-50 border-gray-200 text-gray-400 opacity-70 scale-95";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12">
      <div className="flex justify-center items-center gap-4 md:gap-12 relative">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 transform -translate-y-1/2 hidden md:block" />

        {/* Researcher */}
        <div className={getAgentStyle(AgentRole.RESEARCHER, status)}>
          <div className={`p-4 rounded-full mb-3 ${status === AppStatus.RESEARCHING ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
            <Search size={32} />
          </div>
          <h3 className="font-bold text-lg">Researcher</h3>
          <span className="text-xs uppercase tracking-wider font-medium mt-1">Gathering Data</span>
        </div>

        {/* Judge */}
        <div className={getAgentStyle(AgentRole.JUDGE, status)}>
           <div className={`p-4 rounded-full mb-3 ${status === AppStatus.JUDGING ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
            <Gavel size={32} />
          </div>
          <h3 className="font-bold text-lg">Judge</h3>
          <span className="text-xs uppercase tracking-wider font-medium mt-1">Fact Checking</span>
        </div>

        {/* Writer */}
        <div className={getAgentStyle(AgentRole.WRITER, status)}>
           <div className={`p-4 rounded-full mb-3 ${status === AppStatus.WRITING ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
            <PenTool size={32} />
          </div>
          <h3 className="font-bold text-lg">Writer</h3>
          <span className="text-xs uppercase tracking-wider font-medium mt-1">Drafting Content</span>
        </div>
      </div>

      {status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR && (
        <div className="text-center mt-8 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full text-sm font-medium shadow-lg">
                <Loader2 className="animate-spin" size={16} />
                <span>AI Squad is collaborating...</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatus;