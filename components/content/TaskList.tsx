import React, { useState } from 'react';
import { ClipboardList, Briefcase, Activity, Filter, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { colors, formatDate } from '@/lib/utils';

// Shared Task List component
export const TaskList: React.FC<{
  tasks: any[];
  isLoading: boolean;
  projects?: any[];
  projectName?: string;
}> = ({ tasks, isLoading, projects, projectName }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
         <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
         <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas...</p>
      </div>
    );
  }

  const filters = [
    { id: 'ALL', label: 'SEMUA', icon: Filter },
    { id: 'TO DO', label: 'TO DO', icon: Clock },
    { id: 'IN PROGRESS', label: 'PROSES', icon: PlayCircle },
    { id: 'DONE', label: 'SELESAI', icon: CheckCircle2 },
  ];

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'ALL') return true;
    
    const status = String(task.status_title || task.status || '').toUpperCase();
    
    if (activeFilter === 'DONE') {
      return status === 'DONE' || status === 'COMPLETED';
    }
    if (activeFilter === 'TO DO') {
      return status === 'TO DO' || status === 'OPEN';
    }
    if (activeFilter === 'IN PROGRESS') {
      return status === 'IN PROGRESS' || status === 'ACTIVE';
    }
    
    return status === activeFilter;
  }).sort((a, b) => {
    // Only sort by status priority if in 'ALL' mode
    if (activeFilter !== 'ALL') return 0;

    const getPriority = (t: any) => {
      const s = String(t.status_title || t.status || '').toUpperCase();
      if (s === 'TO DO' || s === 'OPEN') return 1;
      if (s === 'IN PROGRESS' || s === 'ACTIVE') return 2;
      if (s === 'DONE' || s === 'COMPLETED') return 3;
      return 4;
    };

    return getPriority(a) - getPriority(b);
  });

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{ 
              backgroundColor: activeFilter === f.id ? `${colors.gold}20` : 'transparent',
              borderColor: activeFilter === f.id ? colors.gold : 'rgba(255,255,255,0.05)'
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap group active:scale-95`}
          >
            <f.icon className={`w-3.5 h-3.5 ${activeFilter === f.id ? 'text-[#C69C3D]' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
            <span className={`text-[10px] font-bold tracking-widest ${activeFilter === f.id ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111111] rounded-[2.5rem] border border-white/5 border-dashed animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-white/5">
             <ClipboardList className="w-8 h-8 text-neutral-700" />
          </div>
          <p className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
            Tidak ada tugas dengan status <br/>
            <span style={{ color: colors.gold }}>{activeFilter}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredTasks.map((task: any, index: number) => {
            const statusStr = String(task.status_title || task.status || '').toLowerCase();
            const isDone = statusStr === 'done' || statusStr === 'completed';
            const isInProgress = statusStr === 'in progress' || statusStr === 'active';
            
            const proj = projects?.find(p => String(p.id) === String(task.project_id));
            const projName = projectName || (proj ? proj.title : `Project ${task.project_id}`);
            
            return (
              <div key={task.id || index} 
                className="p-px rounded-[2rem] overflow-hidden shadow-2xl active:scale-[0.98] transition-all duration-300"
                style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent)' }}
              >
                <div className="bg-[#141414] p-6 rounded-[1.95rem] relative overflow-hidden group">
                   {/* Glow effect on hover */}
                   <div className="absolute inset-0 bg-gradient-to-br from-[#C69C3D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   {/* Header: Status Indicator & Title */}
                   <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 shrink-0 transition-colors duration-500 ${
                      isDone 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : isInProgress 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-[16px] leading-tight transition-all duration-500 ${isDone ? 'text-green-500/60' : 'text-white'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* Project & Role Labels (Aligned with Icon) */}
                    <div className="flex flex-col items-start gap-1.5 mb-6">
                        <span className="flex items-center gap-1.5 px-2 py-0.8 bg-white/5 rounded-lg border border-white/5">
                          <Briefcase className="w-2.5 h-2.5 text-[#C69C3D]/70" />
                          <span className="text-[9px] font-bold text-neutral-400 truncate max-w-[220px]">{projName}</span>
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.userRole && (
                            <span className={`text-[8px] px-2 py-0.8 rounded-lg font-black uppercase tracking-widest border ${
                              task.userRole === 'PIC' 
                                 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                 : 'bg-white/5 text-neutral-400/60 border-white/10'
                            }`}>
                              {task.userRole}
                            </span>
                          )}
                          <span className={`px-2 py-0.8 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border-2 transition-all duration-500 whitespace-nowrap ${
                            isDone 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : isInProgress 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                : 'bg-neutral-900 text-neutral-500 border-white/5'
                          }`}>
                            {String(task.status_title || task.status || 'Active').toUpperCase()}
                          </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] leading-relaxed text-neutral-400/80 mb-6 px-1 italic">
                      "{task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci.'}"
                    </p>
                    
                    {/* Footer Meta: Dates with Horizontal Timeline */}
                    <div className="pt-5 border-t border-white/5 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-shrink-0">
                        <p className="text-[8px] text-neutral-600 uppercase tracking-[0.2em] font-black">Mulai</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          <p className="text-[10px] text-neutral-300 font-bold tracking-tight whitespace-nowrap">{formatDate(task.start_date)}</p>
                        </div>
                      </div>

                      {/* Visual Timeline Bar (Centered between dates) */}
                      <div className="flex-1 flex items-center gap-1.5 px-2 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
                        <div className="flex-1 h-px border-t-[1.5px] border-dashed border-neutral-700"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                      </div>

                      <div className="space-y-1 text-right flex-shrink-0">
                        <p className="text-[8px] text-red-500/40 uppercase tracking-[0.2em] font-black">Deadline</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="w-3 h-3 text-red-500/40" />
                          <p className="text-[10px] text-red-200/80 font-bold tracking-tight whitespace-nowrap">{formatDate(task.deadline)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
