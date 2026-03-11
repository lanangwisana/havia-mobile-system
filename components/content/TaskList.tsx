import React from 'react';
import { ClipboardList, Briefcase, Activity, Calendar, Clock } from 'lucide-react';
import { colors } from '@/lib/utils';

// Shared Task List component
export const TaskList: React.FC<{
  tasks: any[];
  isLoading: boolean;
  projects?: any[];
  projectName?: string;
}> = ({ tasks, isLoading, projects, projectName }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
         <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
        <ClipboardList className="w-12 h-12 text-neutral-600 mb-4" />
        <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Tidak ada task<br/>untuk saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task: any, index: number) => {
        const isDone = String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed';
        const proj = projects?.find(p => String(p.id) === String(task.project_id));
        const projName = projectName || (proj ? proj.title : `Project ${task.project_id}`);
        
        return (
          <div key={task.id || index} 
            className="p-px rounded-3xl overflow-hidden shadow-xl active:scale-[0.98] transition-all duration-300 mb-4"
            style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent)' }}
          >
            <div className="bg-[#141414] p-5 rounded-[1.4rem] relative overflow-hidden">
               {/* Header: Icon & Title */}
               <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isDone ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h4 className={`font-bold text-[15px] flex-1 truncate ${isDone ? 'text-green-500/60 line-through' : 'text-white'}`}>
                  {task.title}
                </h4>
              </div>

              <div className="relative z-10 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.2 bg-white/5 rounded-lg border border-white/5 text-[8px] font-bold uppercase tracking-wider text-[#C69C3D]">
                    <Briefcase className="w-3 h-3 opacity-70" /> {projName}
                  </span>
                  {task.userRole && (
                    <span className={`text-[7px] px-2 py-1.2 rounded-lg font-bold uppercase tracking-widest border ${
                      task.userRole === 'PIC' 
                         ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                         : 'bg-white/5 text-neutral-500 border-white/10'
                    }`}>
                      {task.userRole}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-[11px] leading-relaxed text-neutral-400 line-clamp-2">
                  {task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci.'}
                </p>
                
                {/* Footer Meta */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
                  <div className="flex gap-5">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[7px] text-neutral-500 uppercase tracking-widest font-bold">Mulai</p>
                      <p className="text-[10px] text-neutral-300 font-bold">{task.start_date?.split(' ')[0] || '-'}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[7px] text-red-500/60 uppercase tracking-widest font-bold">Deadline</p>
                      <p className="text-[10px] text-red-200/80 font-bold">{task.deadline?.split(' ')[0] || '-'}</p>
                    </div>
                  </div>
                  <span className={`text-[7px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-[0.1em] border shrink-0 ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {String(task.status_title || task.status || 'Active').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
