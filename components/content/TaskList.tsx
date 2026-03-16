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
         <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading Tasks...</p>
      </div>
    );
  }

  const filters = [
    { id: 'ALL', label: 'ALL', icon: Filter },
    { id: 'TO DO', label: 'TO DO', icon: Clock },
    { id: 'IN PROGRESS', label: 'IN PROGRESS', icon: PlayCircle },
    { id: 'DONE', label: 'DONE', icon: CheckCircle2 },
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
              backgroundColor: activeFilter === f.id ? `${colors.gold}15` : 'transparent',
              borderColor: activeFilter === f.id ? colors.gold : '#E5E5E5'
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 whitespace-nowrap group active:scale-95`}
          >
            <f.icon className={`w-3.5 h-3.5 ${activeFilter === f.id ? 'text-[#C69C3D]' : 'text-neutral-500 group-hover:text-black'}`} />
            <span className={`text-[10px] font-bold tracking-widest ${activeFilter === f.id ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-black'}`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-[2.5rem] border border-neutral-200 border-dashed animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
             <ClipboardList className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
            No tasks with status <br/>
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
                className="p-0.5 rounded-[2rem] overflow-hidden shadow-xl active:scale-[0.98] transition-all duration-300"
                style={{ background: 'linear-gradient(145deg, #F0F0F0, transparent)' }}
              >
                <div className="bg-white p-6 rounded-[1.95rem] relative overflow-hidden group border border-neutral-100 shadow-sm transition-all group-active:shadow-none">
                   {/* Glow effect on hover */}
                   <div className="absolute inset-0 bg-gradient-to-br from-[#C69C3D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   {/* Header: Status Indicator & Title */}
                   <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 shrink-0 transition-colors duration-500 ${
                      isDone 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : isInProgress 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-[16px] leading-tight transition-all duration-500 ${isDone ? 'text-green-600/60' : 'text-neutral-900'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* Project & Role Labels (Aligned with Icon) */}
                    <div className="flex flex-col items-start gap-1.5 mb-6">
                        <span className="flex items-center gap-1.5 px-2 py-0.8 bg-neutral-50 rounded-lg border border-neutral-100">
                          <Briefcase className="w-2.5 h-2.5 text-[#C69C3D]/70" />
                          <span className="text-[9px] font-bold text-neutral-500 truncate max-w-[220px]">{projName}</span>
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.userRole && (
                            <span className={`text-[8px] px-2 py-0.8 rounded-lg font-black uppercase tracking-widest border ${
                              task.userRole === 'PIC' 
                                 ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                 : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                            }`}>
                              {task.userRole}
                            </span>
                          )}
                          <span className={`px-2 py-0.8 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border-2 transition-all duration-500 whitespace-nowrap ${
                            isDone 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                              : isInProgress 
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                          }`}>
                            {String(task.status_title || task.status || 'Active').toUpperCase()}
                          </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] leading-relaxed text-neutral-500 mb-6 px-1 italic">
                      "{task.description?.replace(/(<([^>]+)>)/gi, "") || 'No detailed description.'}"
                    </p>
                    
                    {/* Footer Meta: Dates with Horizontal Timeline */}
                    <div className="pt-5 border-t border-white/5 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-shrink-0">
                        <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] font-black">Start</p>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <p className="text-[10px] text-neutral-600 font-bold tracking-tight whitespace-nowrap">{formatDate(task.start_date)}</p>
                        </div>
                      </div>

                      {/* Visual Timeline Bar (Centered between dates) */}
                      <div className="flex-1 flex items-center gap-1.5 px-2 opacity-60">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-200"></div>
                        <div className="flex-1 h-px border-t-[1.5px] border-dashed border-neutral-100"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50"></div>
                      </div>

                      <div className="space-y-1 text-right flex-shrink-0">
                        <p className="text-[8px] text-red-500 uppercase tracking-[0.2em] font-black">Deadline</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Clock className="w-3 h-3 text-red-400" />
                          <p className="text-[10px] text-neutral-900 font-bold tracking-tight whitespace-nowrap">{formatDate(task.deadline)}</p>
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
