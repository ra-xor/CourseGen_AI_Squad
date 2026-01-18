import React, { useState, useCallback } from 'react';
import { AppStatus, AgentRole, AgentLog, CourseContent } from './types';
import * as geminiService from './services/gemini';
import AgentStatus from './components/AgentStatus';
import CourseDisplay from './components/CourseDisplay';
import LogStream from './components/LogStream';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [course, setCourse] = useState<CourseContent | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  const addLog = useCallback((role: AgentRole, message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      role,
      message,
      timestamp: new Date(),
      type
    }]);
  }, []);

  const handleBuildCourse = async () => {
    if (!topic.trim()) return;

    setStatus(AppStatus.RESEARCHING);
    setLogs([]);
    setCourse(null);
    setSources([]);

    try {
      // 1. Orchestrator Initialization
      addLog(AgentRole.ORCHESTRATOR, `Initializing squad for topic: "${topic}"`, 'info');
      await new Promise(r => setTimeout(r, 800)); // UI pacing
      
      let iteration = 0;
      const MAX_ITERATIONS = 3;
      let isApproved = false;
      let currentResearch = "";
      let currentSources: any[] = [];
      let lastFeedback: string | null = null;
      let judgeResult = { isApproved: false, feedback: "" };

      // LOOP: Research <-> Judge
      while (!isApproved && iteration < MAX_ITERATIONS) {
        iteration++;
        
        // --- RESEARCHER PHASE ---
        setStatus(AppStatus.RESEARCHING);
        if (iteration === 1) {
            addLog(AgentRole.ORCHESTRATOR, "Delegating task to Researcher Agent...", 'info');
            addLog(AgentRole.RESEARCHER, "Analyzing topic and searching for comprehensive sources...", 'thinking');
        } else {
            addLog(AgentRole.ORCHESTRATOR, `Iteration ${iteration}/${MAX_ITERATIONS}: Returning to Researcher for improvements.`, 'info');
            addLog(AgentRole.RESEARCHER, `Refining research based on Judge's feedback: "${lastFeedback?.slice(0, 50)}..."`, 'thinking');
        }

        const researchResult = await geminiService.runResearcherAgent(topic, currentResearch, lastFeedback);
        currentResearch = researchResult.text;
        // Merge or replace sources? Replacing is safer for relevance, but we could merge. 
        // For simplicity, we use the latest groundings as they match the latest text.
        currentSources = researchResult.sources; 
        setSources(currentSources);
        
        addLog(AgentRole.RESEARCHER, "Research compilation complete.", 'success');
        addLog(AgentRole.RESEARCHER, `Found ${researchResult.sources.length} sources.`, 'info');
        await new Promise(r => setTimeout(r, 1000));

        // --- JUDGE PHASE ---
        setStatus(AppStatus.JUDGING);
        addLog(AgentRole.ORCHESTRATOR, "Passing research to Judge for quality control.", 'info');
        addLog(AgentRole.JUDGE, "Evaluating accuracy, completeness, and logic...", 'thinking');

        judgeResult = await geminiService.runJudgeAgent(topic, currentResearch);
        
        if (judgeResult.isApproved) {
            addLog(AgentRole.JUDGE, "Research APPROVED. Content meets quality standards.", 'success');
            isApproved = true;
        } else {
            addLog(AgentRole.JUDGE, "Research REJECTED. Issues found.", 'error');
            addLog(AgentRole.JUDGE, `Critique: ${judgeResult.feedback}`, 'info');
            lastFeedback = judgeResult.feedback;
            
            if (iteration >= MAX_ITERATIONS) {
                addLog(AgentRole.ORCHESTRATOR, "Max iterations reached. Proceeding with best available research.", 'info');
            }
        }
        await new Promise(r => setTimeout(r, 1000));
      }

      // --- WRITER PHASE ---
      setStatus(AppStatus.WRITING);
      addLog(AgentRole.ORCHESTRATOR, "Instructing Writer Agent to compile final course.", 'info');
      addLog(AgentRole.WRITER, "Structuring course modules based on verified research...", 'thinking');
      
      const courseResult = await geminiService.runWriterAgent(topic, currentResearch, judgeResult.feedback);
      addLog(AgentRole.WRITER, "Course syllabus and content generated successfully.", 'success');
      
      setCourse(courseResult);
      setStatus(AppStatus.COMPLETED);
      addLog(AgentRole.ORCHESTRATOR, "Process finished. Displaying result.", 'success');

    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      addLog(AgentRole.ORCHESTRATOR, "An error occurred during the orchestration process.", 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && status === AppStatus.IDLE && topic.trim()) {
      handleBuildCourse();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      
      {/* Header Section */}
      <div className="w-full max-w-4xl text-center mt-12 mb-16 fade-in no-print">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
          Turn any topic into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">complete course.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Enter a subject, and our team of AI agents will research, fact-check, and write a comprehensive course for you in seconds.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-2xl relative group fade-in no-print" style={{ zIndex: 50 }}>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-white rounded-full shadow-xl p-2 pr-2 border border-slate-100">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to learn? (e.g., Quantum Physics, Sourdough Baking)"
                className="flex-1 px-6 py-4 text-lg bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                disabled={status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR}
            />
            <button
                onClick={handleBuildCourse}
                disabled={!topic.trim() || (status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR)}
                className={`
                    px-8 py-3 rounded-full font-semibold text-white transition-all flex items-center gap-2
                    ${!topic.trim() || (status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR)
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg active:scale-95'
                    }
                `}
            >
                {status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR ? (
                    'Building...'
                ) : (
                    <>
                        <span>Build</span>
                        <Sparkles size={18} />
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full mt-12">
        {status !== AppStatus.IDLE && (
            <div className="no-print">
                <AgentStatus status={status} />
                <LogStream logs={logs} />
            </div>
        )}

        {course && (
            <div className="print-content">
                <CourseDisplay course={course} sources={sources} />
            </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-slate-400 text-sm no-print">
        <p>Powered by Google Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;