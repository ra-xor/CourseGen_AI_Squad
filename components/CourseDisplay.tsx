import React from 'react';
import { CourseContent } from '../types';
import { BookOpen, CheckCircle, ExternalLink, Layers, Download, Printer } from 'lucide-react';

interface CourseDisplayProps {
  course: CourseContent;
  sources?: any[];
}

const CourseDisplay: React.FC<CourseDisplayProps> = ({ course, sources }) => {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${course.title}\n\n`;
    md += `**Introduction**\n\n${course.introduction}\n\n`;
    md += `## Modules\n\n`;
    course.modules.forEach((module, idx) => {
        md += `### Module ${idx + 1}: ${module.title}\n\n`;
        md += `${module.description}\n\n`;
        md += `**Key Learning Points:**\n`;
        module.keyPoints.forEach(point => {
            md += `- ${point}\n`;
        });
        md += `\n`;
    });
    md += `## Summary\n\n${course.summary}\n\n`;
    
    if (sources && sources.length > 0) {
        md += `## Sources\n\n`;
        sources.forEach(chunk => {
             const web = chunk.web;
             if(web) {
                 md += `- [${web.title}](${web.uri})\n`;
             }
        });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 fade-in mt-8 print-content">
      {/* Header */}
      <div className="bg-slate-900 text-white p-10 relative">
        {/* Export Actions - Hidden in Print */}
        <div className="absolute top-6 right-6 flex gap-3 no-print">
            <button 
                onClick={handlePrint}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                title="Print / Save as PDF"
            >
                <Printer size={20} />
            </button>
            <button 
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg"
            >
                <Download size={18} />
                <span>Export MD</span>
            </button>
        </div>

        <div className="flex items-center gap-3 text-blue-400 mb-4">
          <BookOpen size={24} />
          <span className="font-semibold tracking-wide uppercase text-sm">Comprehensive Course</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight pr-0 md:pr-32">{course.title}</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">{course.introduction}</p>
      </div>

      {/* Modules */}
      <div className="p-8 md:p-12 bg-white">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Layers className="text-blue-600" />
            Course Modules
        </h2>
        
        <div className="space-y-8">
          {course.modules.map((module, idx) => (
            <div key={idx} className="group border-l-4 border-blue-500 pl-6 py-2 hover:bg-blue-50/50 transition-colors rounded-r-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Module {idx + 1}</span>
                <h3 className="text-xl font-bold text-slate-800">{module.title}</h3>
              </div>
              <p className="text-slate-600 mb-4">{module.description}</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {module.keyPoints.map((point, kIdx) => (
                  <div key={kIdx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 p-8 md:p-12 border-t border-gray-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Course Summary</h3>
        <p className="text-slate-600 leading-relaxed mb-8">{course.summary}</p>

        {sources && sources.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sources & References</h4>
            <div className="flex flex-wrap gap-3">
              {sources.map((chunk, idx) => {
                 const web = chunk.web;
                 if (!web) return null;
                 return (
                  <a 
                    key={idx} 
                    href={web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all truncate max-w-[300px]"
                  >
                    <ExternalLink size={14} />
                    <span className="truncate">{web.title || web.uri}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDisplay;