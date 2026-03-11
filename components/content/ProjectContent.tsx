import React from 'react';
import { Activity, Briefcase, User, Clock, Calendar } from 'lucide-react';
import { colors } from '@/lib/utils';

interface ProjectContentProps {
  isLoadingProjects: boolean;
  projects: any[];
  onProjectClick: (id: string, name: string) => void;
}

export const ProjectContent: React.FC<ProjectContentProps> = ({
  isLoadingProjects, projects, onProjectClick
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="px-1 space-y-4">
      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800">
           <div className="w-16 h-16 rounded-full bg-[#C69C3D]/10 flex items-center justify-center mb-4">
               <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Sinkronisasi Project...</p>
        </div>
      ) : projects.length > 0 ? (
        projects.map((project: any, index: number) => {
           const totalPoints = parseFloat(project.total_points || "0");
           const completedPoints = parseFloat(project.completed_points || "0");
           const progress = project.progress ? parseInt(project.progress, 10) : (totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0);
           const isDone = progress === 100 || String(project.status).toLowerCase() === 'completed';
           let statusText = project.status_title || project.status || (isDone ? 'COMPLETED' : 'IN PROGRESS');
           statusText = String(statusText).toUpperCase();
           if (statusText === 'OPEN') statusText = 'AKTIF';
           if (statusText === 'COMPLETED') statusText = 'SELESAI';
           
            return (
            <div 
              key={project.id || index} 
              onClick={() => onProjectClick(project.id, project.title)}
              className="group relative rounded-[2rem] p-px overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-2xl mb-4"
              style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent)' }}
            >
              <div className="bg-[#121212] rounded-[1.95rem] p-5 h-full relative overflow-hidden">
                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none ${isDone ? 'bg-green-500' : 'bg-[#C69C3D]'}`}></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex gap-3 items-start min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isDone ? 'bg-green-500/10 border-green-500/20' : 'bg-[#C69C3D]/10 border-[#C69C3D]/20'}`}>
                        {isDone ? <Activity className="w-5 h-5 text-green-400" /> : <Briefcase className="w-5 h-5 text-[#C69C3D]" />}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <h4 className="font-bold text-white text-[15px] leading-tight group-hover:text-[#C69C3D] transition-colors truncate">{project.title || `Project ${project.id}`}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium truncate">
                            <User className="w-2.5 h-2.5 text-neutral-500 shrink-0" /> {project.company_name || 'Client Internal'}
                          </p>
                          {project.userRole && (
                             <span className={`text-[7px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${
                               project.userRole === 'PIC' 
                                 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                 : 'bg-white/5 text-neutral-500 border-white/10'
                             }`}>
                               {project.userRole}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[7px] px-2 py-1 rounded-lg font-bold uppercase tracking-widest border shrink-0 ${isDone ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20'}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1">Mulai</p>
                      <p className="text-[10px] text-neutral-200 font-bold">{project.start_date || '-'}</p>
                    </div>
                    <div className="bg-red-500/5 p-2 rounded-xl border border-red-500/10">
                      <p className="text-[7px] text-red-500/70 uppercase tracking-widest mb-1">Deadline</p>
                      <p className="text-[10px] text-red-200/90 font-bold">{project.deadline || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[8px] uppercase tracking-widest font-bold">
                      <p className="text-neutral-500">Progress</p>
                      <p className={isDone ? 'text-green-500' : 'text-[#C69C3D]'}>{progress}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                         style={{ width: `${progress}%` }} 
                         className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-green-500' : 'bg-[#C69C3D]'}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-neutral-800">
             <Briefcase className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada project<br/>yang ditugaskan</p>
        </div>
      )}
      </div>
    </div>
  );
};
