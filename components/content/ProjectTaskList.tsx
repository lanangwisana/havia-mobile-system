import React from 'react';
import { ClipboardList, Activity, Clock } from 'lucide-react';
import { colors, formatDate } from '@/lib/utils';

export const ProjectTaskList: React.FC<{
  tasks: any[];
  isLoading: boolean;
  projectName?: string;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
  highlightTaskId?: string | null;
}> = ({ tasks, isLoading, projectName, paginationMeta, onPageChange, highlightTaskId }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-2">
      <div className="px-1 space-y-5">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-[#E8E4E1] border-dashed">
           <div className="w-20 h-20 rounded-full bg-[#F4EBD4] flex items-center justify-center mb-6 shadow-inner">
               <Activity className="w-10 h-10 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-[0.625rem] text-[#C69C3D] uppercase tracking-[0.3em] font-black">Loading Tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-[#E8E4E1] border-dashed">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-100">
             <ClipboardList className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-[0.625rem] text-neutral-400 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
            No tasks found in <br/>
            <span style={{ color: colors.gold }}>{projectName || 'this project'}</span>
          </p>
        </div>
      ) : (
        tasks.map((task: any, index: number) => {
          const statusStr = String(task.status_title || task.status || '').toUpperCase();
          const isDone = statusStr === 'DONE' || statusStr === 'COMPLETED';
          const isInProgress = statusStr === 'IN PROGRESS' || statusStr === 'ACTIVE';
          const taskId = String(task.id || index);
          
          const progress = isDone ? 100 : (isInProgress ? 50 : 0);

          return (
            <div 
              key={taskId} 
              className={`bg-white rounded-xl border ${highlightTaskId === taskId ? 'border-[#C69C3D] shadow-[0_4px_15px_rgba(198,156,61,0.2)]' : 'border-[#E8E4E1] shadow-[0_2px_10px_rgba(0,0,0,0.02)]'} mb-3 p-4 flex flex-col gap-3 transition-all hover:shadow-md`}
            >
              <div className="flex flex-col">
                <h4 className="font-black text-[#2C2A29] text-[0.95rem] leading-snug line-clamp-2">
                  {task.title || task.name || `Task ${task.id}`}
                </h4>
              </div>

              <div className="flex flex-col gap-1.5 mt-1 border-t border-[#E8E4E1] pt-3">
                <div className="flex items-center gap-1.5 opacity-80">
                  <Clock className="w-3.5 h-3.5 text-[#6B6865]" />
                  <span className="text-[0.65rem] font-bold text-[#6B6865] uppercase tracking-widest">
                    Deadline: <span className="text-[#2C2A29] ml-1">{formatDate(task.deadline)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <Activity className="w-3.5 h-3.5 text-[#C69C3D]" />
                  <span className="text-[0.65rem] font-bold text-[#6B6865] uppercase tracking-widest">
                    Progress: <span className="text-[#C69C3D] ml-1">{progress}%</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
      
      {/* Pagination UI */}
      {!isLoading && paginationMeta && paginationMeta.total_pages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-4 pb-0 px-4">
          <div className="flex items-center justify-between w-full max-w-[280px] p-1.5 bg-white rounded-2xl border border-[#E8E4E1] shadow-sm">
            <button 
              disabled={paginationMeta.current_page <= 1}
              onClick={() => onPageChange?.(paginationMeta.current_page - 1)}
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                const current = paginationMeta.current_page;
                const total = paginationMeta.total_pages;
                if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
                  return (
                    <button key={p} onClick={() => onPageChange?.(p)} className={`w-8 h-8 rounded-lg font-black text-[0.6875rem] transition-all duration-300 flex items-center justify-center ${current === p ? 'bg-[#C69C3D] text-white shadow-sm' : 'bg-transparent text-[#6B6865]/60 hover:text-[#282524] hover:bg-[#2C2A29]/5'}`}>{p}</button>
                  );
                } else if (p === current - 2 || p === current + 2) {
                  return <span key={p} className="text-[#6B6865]/20 text-[0.5625rem]">..</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={!paginationMeta.has_more}
              onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >Next</button>
          </div>
          <div className="flex items-center gap-3 opacity-40">
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">Page {paginationMeta.current_page} / {paginationMeta.total_pages}</span>
             <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">{paginationMeta.total_records} Tasks</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
