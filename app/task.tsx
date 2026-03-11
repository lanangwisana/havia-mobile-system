"use client";

import React from 'react';
import {
  Briefcase, ClipboardList, Calendar, Clock, Activity
} from 'lucide-react';

// Props interface
interface TaskContentProps {
  projectTasks: any[];
  isLoadingTasks: boolean;
  projects: any[];
  colors: {
    gold: string;
    darkGold: string;
    bg: string;
    card: string;
    border: string;
    textMuted: string;
  };
}

interface ProjectTasksContentProps {
  projectTasks: any[];
  isLoadingTasks: boolean;
  activeProjectName: string;
  colors: {
    gold: string;
    darkGold: string;
    bg: string;
    card: string;
    border: string;
    textMuted: string;
  };
}

export function SemuaTaskContent({ projectTasks, isLoadingTasks, projects, colors }: TaskContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Semua Task Proyek</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{projectTasks.length} Tugas</span>
      </div>

      {isLoadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
           <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas...</p>
        </div>
      ) : projectTasks.length > 0 ? (
        <div className="space-y-4">
          {projectTasks.map((task: any, index: number) => {
            const isDone = String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed';
            const proj = projects.find(p => String(p.id) === String(task.project_id));
            const projName = proj ? proj.title : `Project ${task.project_id}`;
            
            return (
            <div key={task.id || index} style={{ backgroundColor: colors.card, borderColor: isDone ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)' }} className="p-5 rounded-[2rem] border relative overflow-hidden group shadow-xl">
              <div className="flex gap-4 items-start relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-inner ${isDone ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-base mb-2 truncate ${isDone ? 'text-green-400/90 line-through' : 'text-white'}`}>{task.title}</h4>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1818]/60 rounded-lg border border-white/5 text-[9px] font-bold uppercase tracking-widest text-[#C69C3D] mb-3">
                     <Briefcase className="w-3 h-3" /> {projName}
                  </span>
                    <p className="text-xs leading-relaxed text-neutral-400 line-clamp-2 mb-4">
                    {task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/5">
                    <div className="flex gap-6">
                      {task.start_date && (
                        <div>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-1 font-bold">Mulai</p>
                          <p className="text-[10px] text-neutral-300 font-medium font-mono">{task.start_date.split(' ')[0]}</p>
                        </div>
                      )}
                      {task.deadline && (
                        <div>
                          <p className="text-[8px] text-red-500/90 uppercase tracking-[0.2em] mb-1 font-bold">Deadline</p>
                          <p className="text-[10px] text-red-200 font-medium font-mono">{task.deadline.split(' ')[0]}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span className={`text-[8px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-[0.15em] border whitespace-nowrap shadow-sm ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                        {String(task.status_title || task.status || 'Aktif').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <ClipboardList className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Tidak ada task<br/>untuk saat ini</p>
        </div>
      )}
    </div>
  );
}

export function ProjectTasksContent({ projectTasks, isLoadingTasks, activeProjectName, colors }: ProjectTasksContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Tasks: <span className="text-[#C69C3D]">{activeProjectName || 'Project'}</span></h3>
        </div>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{projectTasks.length} Tugas</span>
      </div>

      {isLoadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
           <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas Proyek...</p>
        </div>
      ) : projectTasks.length > 0 ? (
        <div className="space-y-4">
          {projectTasks.map((task: any, index: number) => {
            const isDone = String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed';
            
            return (
              <div key={task.id || index} style={{ backgroundColor: colors.card, borderColor: isDone ? 'rgba(34,197,94,0.2)' : colors.border }} className="p-4 rounded-3xl border relative overflow-hidden group shadow-lg">
                <div className="flex gap-4 items-start relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 mt-1 ${isDone ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-[#C69C3D]/10 border-[#C69C3D]/20 text-[#C69C3D]'}`}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-2 ${isDone ? 'text-green-400/90 line-through' : 'text-white'}`}>{task.title}</h4>
                    <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed mb-4 line-clamp-2">
                      {task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci untuk task ini.'}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50">
                      {task.deadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <p className="text-[10px] text-neutral-400 font-medium">{task.deadline}</p>
                        </div>
                      )}
                      <div className="ml-auto">
                        <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider border ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                          {String(task.status_title || task.status || 'Aktif').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <Calendar className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada task<br/>di proyek ini</p>
        </div>
      )}
    </div>
  );
}
