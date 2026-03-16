import React, { useState } from 'react';
import { Activity, Briefcase, User, Clock, Filter, CheckCircle2, AlertCircle, XCircle, ChevronDown } from 'lucide-react';
import { colors, formatDate } from '@/lib/utils';

interface ProjectContentProps {
  isLoadingProjects: boolean;
  projects: any[];
  onProjectClick: (id: string, name: string) => void;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
  onFilterChange?: (status: string) => void;
}

  export const ProjectContent: React.FC<ProjectContentProps> = ({
  isLoadingProjects, projects, onProjectClick, paginationMeta, onPageChange, onFilterChange
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters = [
    { id: 'ALL', label: 'ALL', icon: Filter },
    { id: 'OPEN', label: 'OPEN', icon: Activity },
    { id: 'HOLD', label: 'HOLD', icon: Clock },
    { id: 'CANCELED', label: 'CANCELED', icon: XCircle },
    { id: 'COMPLETED', label: 'COMPLETED', icon: CheckCircle2 },
  ];

  const activeFilterObj = filters.find(f => f.id === activeFilter) || filters[0];

  const getProjectCategory = (p: any) => {
    const s = String(p.status || '').toUpperCase().trim();
    const st = String(p.status_title || '').toUpperCase().trim();
    
    if (s === 'COMPLETED' || s === 'DONE' || st === 'COMPLETED' || st === 'DONE' || st === 'SELESAI') return 'COMPLETED';
    if (s === 'CANCELED' || st === 'CANCELED' || st === 'BATAL') return 'CANCELED';
    if (s === 'HOLD' || st === 'HOLD') return 'HOLD';
    if (s === 'OPEN' || st === 'OPEN' || st === 'AKTIF') return 'OPEN';
    
    return 'OPEN'; // Fallback for active projects
  };

  // Sorting is now handled by the backend for better performance
  const projectList = projects;

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-2">
      {/* Filter Dropdown - Always show if not loading so user can change filter even if list is empty */}
      {!isLoadingProjects && (
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
                <span className="text-[9px] text-[#6B6865] uppercase tracking-widest font-black">Filter Status</span>
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
                      activeFilter === f.id 
                        ? 'bg-[#C69C3D] text-white' 
                        : 'hover:bg-[#F4EBD4]/30 text-[#6B6865]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFilter === f.id ? 'bg-white/20' : 'bg-neutral-100'}`}>
                      <f.icon className={`w-4 h-4 ${activeFilter === f.id ? 'text-white' : 'text-[#C69C3D]'}`} />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest uppercase">
                      {f.label}
                    </span>
                    {activeFilter === f.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Backdrop (Removed background as requested) */}
          {isDropdownOpen && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)}></div>
          )}
        </div>
      )}

      <div className="px-1 space-y-5">
      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-[#E8E4E1] border-dashed">
           <div className="w-20 h-20 rounded-full bg-[#F4EBD4] flex items-center justify-center mb-6 shadow-inner">
               <Activity className="w-10 h-10 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-[10px] text-[#C69C3D] uppercase tracking-[0.3em] font-black">Syncing Workspace...</p>
        </div>
      ) : projectList.length > 0 ? (
        projectList.map((project: any, index: number) => {
            const totalPoints = parseFloat(project.total_points || "0");
            const completedPoints = parseFloat(project.completed_points || "0");
            const progress = project.progress ? parseInt(project.progress, 10) : (totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0);
            
            const category = getProjectCategory(project);
            const isDone = category === 'COMPLETED';
            const isHold = category === 'HOLD';
            const isCanceled = category === 'CANCELED';

            const statusText = project.status_title || project.status || (isDone ? 'COMPLETED' : 'IN PROGRESS');
            const projectId = project.id || String(index);
            const isExpanded = expandedProjectId === projectId;
            
             return (
             <div 
               key={projectId} 
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
                 {/* Premium Background Gradient Layer */}
                 <div className={`absolute inset-0 transition-opacity duration-700 ${isExpanded ? 'opacity-100' : 'opacity-10'}`}
                      style={{ 
                        background: 'linear-gradient(160deg, #FFFFFF 0%, #F4EBD4 100%)' 
                      }} 
                 />
                 
                 {/* Decorative Light Glow */}
                 <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C69C3D] opacity-[0.03] blur-[60px] rounded-full pointer-events-none" />
                 
                 {/* Accordion Header */}
                 <div 
                   onClick={() => onProjectClick(project.id, project.title)}
                   className="p-6 relative z-10 cursor-pointer active:scale-[0.99] transition-all duration-300"
                 >
                    <div className="flex justify-between items-center">
                     <div className="flex gap-5 items-center min-w-0 flex-1">
                       <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-all duration-500 bg-white border-[#C69C3D]/30 text-[#C69C3D] shadow-sm">
                         {isDone ? <CheckCircle2 className="w-7 h-7" /> : isCanceled ? <XCircle className="w-7 h-7" /> : isHold ? <Clock className="w-7 h-7" /> : <Briefcase className="w-7 h-7" />}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <h4 className={`font-black text-[15px] leading-tight truncate transition-all duration-500 ${isDone ? 'text-neutral-400' : 'text-[#2C2A29]'}`}>
                           {project.title || `Project ${project.id}`}
                         </h4>
                         <div className="flex items-center gap-2 mt-1.5 opacity-80">
                            <div className="w-4 h-4 rounded-full bg-[#F4EBD4] flex items-center justify-center border border-[#C69C3D]/10">
                              <User className="w-2.5 h-2.5 text-[#C69C3D]" />
                            </div>
                            <p className="text-[11px] text-[#2C2A29] font-bold tracking-tight truncate max-w-[150px]">
                              {project.company_name || 'Client Internal'}
                            </p>
                         </div>
                         
                         {/* Status & Role Labels */}
                         <div className="flex items-center gap-1 mt-3 flex-nowrap overflow-hidden">
                           {project.userRole && (
                               <span className="text-[7px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tight border shrink-0 shadow-sm bg-[#2C2A29] text-white border-[#2C2A29]">
                                 {project.userRole === 'MEMBER' ? 'TEAM MEMBER' : project.userRole}
                               </span>
                            )}
                            <span className={`text-[7px] px-2.5 py-1 rounded-lg font-black uppercase tracking-tight border-2 shrink-0 transition-colors duration-500 shadow-sm ${
                              isDone 
                                ? 'bg-white text-green-600 border-green-500/30' 
                                : isHold
                                  ? 'bg-white text-orange-600 border-orange-500/30'
                                  : isCanceled
                                    ? 'bg-white text-red-600 border-red-500/30'
                                    : 'bg-white text-[#C69C3D] border-[#C69C3D]/30'
                            }`}>
                              {statusText.toUpperCase()}
                            </span>
                         </div>
                       </div>
                     </div>
                     
                     {/* Toggle */}
                     <button 
                       onClick={(e) => toggleAccordion(projectId, e)}
                       className={`ml-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm border ${
                         isExpanded ? 'bg-[#C69C3D] text-white border-[#C69C3D]' : 'bg-white text-[#C69C3D] border-[#E8E4E1]'
                       }`}
                     >
                       <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                     </button>
                    </div>
                 </div>
                  
                 {/* Expandable Content */}
                 <div className={`overflow-hidden relative z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'}`}>
                   <div className="px-7 pb-8 pt-4 border-t border-[#E8E4E1]">
                     {/* Dates UI */}
                     <div className="flex items-center justify-between gap-4 mb-8 p-4 bg-white/60 rounded-2xl border border-[#E8E4E1] shadow-sm backdrop-blur-md">
                       <div className="space-y-1.5">
                         <p className="text-[9px] text-[#6B6865] uppercase tracking-widest font-black opacity-60">Start Project</p>
                         <div className="flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-[#C69C3D]" />
                           <p className="text-[11px] text-[#2C2A29] font-black tracking-tight">{formatDate(project.start_date)}</p>
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
                           <p className="text-[11px] text-[#2C2A29] font-black tracking-tight">{formatDate(project.deadline)}</p>
                         </div>
                       </div>
                     </div>
                     
                     {/* Progress UI */}
                     <div className="space-y-3 px-1">
                       <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[9px] text-[#6B6865] uppercase tracking-[0.2em] font-black mb-1">Current Progress</p>
                            <div className="flex items-center gap-2">
                              <Activity className="w-3 h-3 text-[#C69C3D]" />
                              <span className="text-[12px] font-black text-[#2C2A29]">System Updated</span>
                            </div>
                         </div>
                         <p className={`text-[18px] font-black italic text-[#C69C3D] drop-shadow-sm`}>{progress}%</p>
                       </div>
                       <div className="h-3 w-full bg-[#2C2A29]/5 rounded-full overflow-hidden p-[2.5px] border border-[#E8E4E1]">
                         <div 
                            style={{ width: `${progress}%` }} 
                            className="h-full rounded-full transition-all duration-1000 bg-[#C69C3D]"
                         ></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             );
         })
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-[2.5rem] border border-neutral-200 border-dashed">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
             <Briefcase className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
            No projects with status <br/>
            <span style={{ color: colors.gold }}>{activeFilter}</span>
          </p>
        </div>
      )}
      
      {/* Pagination UI - MINIMALIST CARD THEME */}
      {!isLoadingProjects && paginationMeta && paginationMeta.total_pages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-4 pb-0 px-4">
          {/* Main Pagination Bar */}
          <div className="flex items-center justify-between w-full max-w-[280px] p-1.5 bg-white rounded-2xl border border-[#E8E4E1] shadow-sm">
            <button 
              disabled={paginationMeta.current_page <= 1}
              onClick={() => onPageChange?.(paginationMeta.current_page - 1)}
              className="px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                const current = paginationMeta.current_page;
                const total = paginationMeta.total_pages;
                
                if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
                   return (
                    <button
                      key={p}
                      onClick={() => onPageChange?.(p)}
                      className={`w-8 h-8 rounded-lg font-black text-[11px] transition-all duration-300 flex items-center justify-center ${
                        current === p 
                          ? 'bg-[#C69C3D] text-white shadow-sm' 
                          : 'bg-transparent text-[#6B6865]/60 hover:text-[#282524] hover:bg-[#2C2A29]/5'
                      }`}
                    >
                      {p}
                    </button>
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
            >
              Next
            </button>
          </div>
          
          {/* Subtle Metadata */}
          <div className="flex items-center gap-3 opacity-40">
             <span className="text-[9px] text-[#6B6865] font-black uppercase tracking-widest">
               Page {paginationMeta.current_page} / {paginationMeta.total_pages}
             </span>
             <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
             <span className="text-[9px] text-[#6B6865] font-black uppercase tracking-widest">
               {paginationMeta.total_records} Projects
             </span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
