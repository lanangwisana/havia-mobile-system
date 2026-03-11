"use client";

import React from 'react';
import { Activity, Briefcase, User, Clock, Calendar } from 'lucide-react';

// Props interfaces
interface ProjectColors {
  gold: string;
  darkGold: string;
  bg: string;
  card: string;
  border: string;
  textMuted: string;
}

interface ProyekContentProps {
  projects: any[];
  isLoadingProjects: boolean;
  colors: ProjectColors;
  setActiveProjectId: (id: string) => void;
  setActiveProjectName: (name: string) => void;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
}

export function ProyekContent({
  projects, isLoadingProjects, colors,
  setActiveProjectId, setActiveProjectName, handleNav
}: ProyekContentProps) {
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
              onClick={() => { 
                setActiveProjectId(project.id); 
                setActiveProjectName(project.title); 
                handleNav('subpage', null, 'Project Tasks'); 
              }}
              style={{ backgroundColor: colors.card, borderColor: colors.border }} 
              className="rounded-3xl border relative overflow-hidden group hover:border-[#C69C3D]/50 transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.98]"
            >
              
              <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500 ${isDone ? 'bg-green-500' : 'bg-[#C69C3D]'}`}></div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex gap-4 items-center flex-1 pr-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 transition-colors ${isDone ? 'bg-green-500/10 border-green-500/20' : 'bg-[#C69C3D]/10 border-[#C69C3D]/20 group-hover:bg-[#C69C3D]/20'}`}>
                      {isDone ? <Activity className="w-6 h-6 text-green-400" /> : <Briefcase className="w-6 h-6 text-[#C69C3D]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight group-hover:text-[#C69C3D] transition-colors">{project.title || `Project ${project.id}`}</h4>
                      {project.company_name ? (
                        <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-neutral-500" /> {project.company_name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Internal Project</p>
                      )}
                    </div>
                  </div>
                  
                  <span className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border shrink-0 ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]'}`}>
                    {statusText}
                  </span>
                </div>
                
                <div className="flex gap-3 mb-5 relative z-10">
                  {project.start_date && (
                    <div className="bg-neutral-900/80 px-3 py-2 rounded-xl flex-1 border border-neutral-800/50 flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-0.5">Mulai</p>
                        <p className="text-[10px] text-white font-medium">{project.start_date}</p>
                      </div>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="bg-red-500/5 px-3 py-2 rounded-xl flex-1 border border-red-500/10 flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500/80" />
                      <div>
                        <p className="text-[8px] text-red-500/80 uppercase tracking-widest mb-0.5">Deadline</p>
                        <p className="text-[10px] text-red-100 font-medium">{project.deadline}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-neutral-800/50 mt-2 relative z-10">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                       Status Progress
                    </span>
                    <span style={{ color: isDone ? '#22c55e' : colors.gold }} className="text-base leading-none font-bold font-mono">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden shadow-inner relative border border-black backdrop-blur-sm">
                    <div 
                       style={{ 
                         backgroundColor: isDone ? '#22c55e' : colors.gold, 
                         width: `${progress}%` 
                       }} 
                       className="absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
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
}
