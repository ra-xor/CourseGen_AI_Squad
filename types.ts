export enum AgentRole {
  ORCHESTRATOR = 'Orchestrator',
  RESEARCHER = 'Researcher',
  JUDGE = 'Judge',
  WRITER = 'Writer'
}

export interface AgentLog {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'thinking';
}

export interface CourseContent {
  title: string;
  introduction: string;
  modules: Array<{
    title: string;
    description: string;
    keyPoints: string[];
  }>;
  summary: string;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export enum AppStatus {
  IDLE = 'idle',
  RESEARCHING = 'researching',
  JUDGING = 'judging',
  WRITING = 'writing',
  COMPLETED = 'completed',
  ERROR = 'error'
}