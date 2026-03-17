import React, { useState, useEffect } from 'react';
import { ClipboardList, Briefcase, Activity, Filter, CheckCircle2, Clock, PlayCircle, ChevronDown } from 'lucide-react';
import { colors, formatDate } from '@/lib/utils';

// Shared Task List component
export const TaskList: React.FC<{
  tasks: any[];
  isLoading: boolean;
  projects?: any[];
  projectName?: string;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
  onFilterChange?: (status: string) => void;
  highlightTaskId?: string | null;
}> = ({ tasks, isLoading, projects, projectName, paginationMeta, onPageChange, onFilterChange, highlightTaskId }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightTaskId) {
      setExpandedTaskId(highlightTaskId);
    }
  }, [highlightTaskId]);

  const filters = [
    { id: 'ALL', label: 'ALL', icon: Filter },
    { id: 'TO DO', label: 'TO DO', icon: Clock },
    { id: 'IN PROGRESS', label: 'IN PROGRESS', icon: PlayCircle },
    { id: 'DONE', label: 'DONE', icon: CheckCircle2 },
  ];

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const activeFilterObj = filters.find(f => f.id === activeFilter) || filters[0];
  const taskList = tasks;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-2">
      {/* Filter Dropdown */}
      {!isLoading && (
        <div className="px-1 relative z-50">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-3xl border border-[#E8E4E1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C69C3D]/10 flex items-center justify-center">
                <activeFilterObj.icon className="w-5 h-5 text-[#C69C3D]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[9px] text-[#6B6865] uppercase tracking-widest font-black">Filter Task</span>
                <span className="text-[13px] font-bold text-[#2C2A29] tracking-tight uppercase">{activeFilterObj.label}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#F4EBD4]/50 flex items-center justify-center border border-[#C69C3D]/10">
              <ChevronDown className={`w-4 h-4 text-[#C69C3D] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-1 right-1 mt-2 bg-white rounded-[2rem] border border-[#E8E4E1] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[60]">
              <div className="p-2 space-y-1">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id);
                      setIsDropdownOpen(false);
                      if (onFilterChange) onFilterChange(f.id);
                    }}
                    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all ${
                      activeFilter === f.id ? 'bg-[#C69C3D] text-white' : 'hover:bg-[#F4EBD4]/30 text-[#6B6865]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFilter === f.id ? 'bg-white/20' : 'bg-neutral-100'}`}>
                      <f.icon className={`w-4 h-4 ${activeFilter === f.id ? 'text-white' : 'text-[#C69C3D]'}`} />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest uppercase">{f.label}</span>
                    {activeFilter === f.id && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isDropdownOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)}></div>}
        </div>
      )}

      <div className="px-1 space-y-5">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-[#E8E4E1] border-dashed">
           <div className="w-20 h-20 rounded-full bg-[#F4EBD4] flex items-center justify-center mb-6 shadow-inner">
               <Activity className="w-10 h-10 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-[10px] text-[#C69C3D] uppercase tracking-[0.3em] font-black">Updating Tasks...</p>
        </div>
      ) : taskList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-[#E8E4E1] border-dashed">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-100">
             <ClipboardList className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
            No tasks with status <br/>
            <span style={{ color: colors.gold }}>{activeFilter}</span>
          </p>
        </div>
      ) : (
        taskList.map((task: any, index: number) => {
          const statusStr = String(task.status_title || task.status || '').toUpperCase();
          const isDone = statusStr === 'DONE' || statusStr === 'COMPLETED';
          const isInProgress = statusStr === 'IN PROGRESS' || statusStr === 'ACTIVE';
          const taskId = String(task.id || index);
          const isExpanded = String(expandedTaskId) === taskId;
          
          const proj = projects?.find(p => String(p.id) === String(task.project_id));
          const projName = projectName || (proj ? proj.title : `Project ${task.project_id}`);
          const progress = isDone ? 100 : (isInProgress ? 50 : 0);
          
          return (
            <div 
              key={taskId} 
              className="group relative rounded-[2rem] p-[1.5px] transition-all duration-700 mb-4"
              style={{ 
                background: isExpanded 
                  ? 'linear-gradient(135deg, #C69C3D, #F4EBD4, #C69C3D)' 
                  : 'linear-gradient(135deg, #D4D1CE, #FFFFFF, #D4D1CE)',
                boxShadow: isExpanded 
                  ? '0 20px 40px rgba(198, 156, 61, 0.18)' 
                  : '0 8px 25px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div className="bg-white rounded-[1.92rem] overflow-hidden relative">
                <div className={`absolute inset-0 transition-opacity duration-700 ${isExpanded ? 'opacity-100' : 'opacity-10'}`}
                     style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F4EBD4 100%)' }} 
                />
                
                {/* Header Section */}
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-5 items-center min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-all duration-500 bg-white border-[#C69C3D]/30 text-[#C69C3D] shadow-sm">
                        {isDone ? <CheckCircle2 className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className={`font-black text-[15px] leading-tight truncate transition-all duration-500 ${isDone ? 'text-neutral-400' : 'text-[#2C2A29]'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 opacity-80">
                          <div className="w-4 h-4 rounded-full bg-[#F4EBD4] flex items-center justify-center border border-[#C69C3D]/10">
                            <Briefcase className="w-2.5 h-2.5 text-[#C69C3D]" />
                          </div>
                          <p className="text-[11px] text-[#2C2A29] font-bold tracking-tight truncate max-w-[150px]">
                            {projName}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-3 flex-nowrap overflow-hidden">
                          {task.userRole && (
                            <span className="text-[7px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tight border shrink-0 bg-[#2C2A29] text-white border-[#2C2A29]">
                              {task.userRole}
                            </span>
                          )}
                          <span className={`text-[7px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tight border-2 shrink-0 transition-colors duration-500 ${
                            isDone ? 'bg-white text-green-600 border-green-500/30' : isInProgress ? 'bg-white text-blue-600 border-blue-500/30' : 'bg-white text-[#C69C3D] border-[#C69C3D]/30'
                          }`}>
                            {statusStr}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => toggleAccordion(taskId, e)}
                      className={`ml-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm border ${
                        isExpanded ? 'bg-[#C69C3D] text-white border-[#C69C3D]' : 'bg-white text-[#C69C3D] border-[#E8E4E1]'
                      }`}
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Expandable Section */}
                <div className={`overflow-hidden relative z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'max-h-[450px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-7 pb-8 pt-4 border-t border-[#E8E4E1]">
                    {/* Inner Card: Dates */}
                    <div className="flex items-center justify-between gap-4 mb-8 p-4 bg-white/60 rounded-2xl border border-[#E8E4E1] shadow-sm backdrop-blur-md">
                      <div className="space-y-1.5">
                        <p className="text-[9px] text-[#6B6865] uppercase tracking-widest font-black opacity-60">Start Task</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#C69C3D]" />
                          <p className="text-[11px] text-[#2C2A29] font-black tracking-tight">{formatDate(task.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1 opacity-20 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C69C3D]"></div>
                        <div className="flex-1 w-px h-8 border-l-2 border-dashed border-[#C69C3D]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C69C3D]"></div>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <p className="text-[9px] text-[#6B6865] uppercase tracking-widest font-black opacity-60">Deadline</p>
                        <div className="flex items-center gap-2 justify-end">
                          <Clock className="w-3.5 h-3.5 text-[#C69C3D]" />
                          <p className="text-[11px] text-[#2C2A29] font-black tracking-tight">{formatDate(task.deadline)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description Area */}
                    <div className="mb-8 px-1">
                      <p className="text-[9px] text-[#6B6865] uppercase tracking-[0.2em] font-black mb-2 opacity-60">Description</p>
                      <p className="text-[12px] leading-relaxed text-[#2C2A29] italic bg-[#F4EBD4]/20 p-4 rounded-2xl border border-[#E8E4E1] border-dashed">
                        "{task.description?.replace(/(<([^>]+)>)/gi, "") || 'No detailed description.'}"
                      </p>
                    </div>
                    
                    {/* Progress UI */}
                    <div className="space-y-3 px-1">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-[#6B6865] uppercase tracking-[0.2em] font-black mb-1">Current Progress</p>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-[#C69C3D]" />
                            <span className="text-[12px] font-black text-[#2C2A29]">Task {isDone ? 'Completed' : 'Status'}</span>
                          </div>
                        </div>
                        <p className="text-[18px] font-black italic text-[#C69C3D] drop-shadow-sm">{progress}%</p>
                      </div>
                      <div className="h-3 w-full bg-[#2C2A29]/5 rounded-full overflow-hidden p-[2.5px] border border-[#E8E4E1]">
                        <div style={{ width: `${progress}%` }} className="h-full rounded-full transition-all duration-1000 bg-[#C69C3D]"></div>
                      </div>
                    </div>
                  </div>
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
              className="px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                const current = paginationMeta.current_page;
                const total = paginationMeta.total_pages;
                if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
                  return (
                    <button key={p} onClick={() => onPageChange?.(p)} className={`w-8 h-8 rounded-lg font-black text-[11px] transition-all duration-300 flex items-center justify-center ${current === p ? 'bg-[#C69C3D] text-white shadow-sm' : 'bg-transparent text-[#6B6865]/60 hover:text-[#282524] hover:bg-[#2C2A29]/5'}`}>{p}</button>
                  );
                } else if (p === current - 2 || p === current + 2) {
                  return <span key={p} className="text-[#6B6865]/20 text-[9px]">..</span>;
                }
                return null;
              })}
            </div>
            <button 
              disabled={!paginationMeta.has_more}
              onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
              className="px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >Next</button>
          </div>
          <div className="flex items-center gap-3 opacity-40">
             <span className="text-[9px] text-[#6B6865] font-black uppercase tracking-widest">Page {paginationMeta.current_page} / {paginationMeta.total_pages}</span>
             <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
             <span className="text-[9px] text-[#6B6865] font-black uppercase tracking-widest">{paginationMeta.total_records} Tasks</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
