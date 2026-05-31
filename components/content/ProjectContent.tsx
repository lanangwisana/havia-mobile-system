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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-2">


      <div className="px-1 space-y-5">
      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border border-[#E8E4E1] border-dashed">
           <div className="w-20 h-20 rounded-full bg-[#F4EBD4] flex items-center justify-center mb-6 shadow-inner">
               <Activity className="w-10 h-10 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-[0.625rem] text-[#C69C3D] uppercase tracking-[0.3em] font-black">Syncing Workspace...</p>
        </div>
      ) : projectList.length > 0 ? (
        projectList.map((project: any, index: number) => {
            const category = getProjectCategory(project);
            const isDone = category === 'COMPLETED';
            const projectId = project.id || String(index);

            const totalPoints = parseFloat(project.total_points || "0");
            const completedPoints = parseFloat(project.completed_points || "0");
            const progress = project.progress ? parseInt(project.progress, 10) : (totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0);
            
             return (
              <div 
                key={projectId} 
                onClick={() => onProjectClick(project.id, project.title)}
                className="bg-white rounded-xl border border-[#E8E4E1] shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-3 p-4 flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
              >
                <div className="flex flex-col">
                  <h4 className="font-black text-[#2C2A29] text-[0.95rem] leading-snug line-clamp-2">
                    {project.title || `Project ${project.id}`}
                  </h4>
                </div>

                <div className="flex flex-col gap-1.5 mt-1 border-t border-[#E8E4E1] pt-3">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Clock className="w-3.5 h-3.5 text-[#6B6865]" />
                    <span className="text-[0.65rem] font-bold text-[#6B6865] tracking-wide">
                      Deadline: <span className="text-[#2C2A29] ml-1">{formatDate(project.deadline)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80 mt-1">
                    <Activity className="w-3.5 h-3.5 text-[#C69C3D]" />
                    {project.planned_progress !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-bold text-[#6B6865] tracking-wide">
                          Plan: <span className="text-[#2C2A29] ml-1">{Number(project.planned_progress).toFixed(1)}%</span>
                        </span>
                        <span className="text-[0.65rem] font-bold text-[#D1D5DB]">|</span>
                        <span className="text-[0.65rem] font-bold text-[#6B6865] tracking-wide">
                          Act: <span className="text-[#2C2A29] ml-1">{Number(project.actual_progress).toFixed(1)}%</span>
                        </span>
                        <span className="text-[0.65rem] font-bold text-[#D1D5DB]">|</span>
                        <span className="text-[0.65rem] font-bold text-[#6B6865] tracking-wide">
                          Dev: <span className={`ml-1 ${Number(project.deviation) < 0 ? 'text-red-500' : Number(project.deviation) === 0 ? 'text-[#2C2A29]' : 'text-emerald-500'}`}>{Number(project.deviation) > 0 ? '+' : ''}{Number(project.deviation).toFixed(1)}%</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[0.65rem] font-bold text-[#6B6865] tracking-wide">
                        Progress: <span className="text-[#C69C3D] ml-1">{progress}%</span>
                      </span>
                    )}
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
          <p className="text-[0.625rem] text-neutral-400 tracking-[0.2em] uppercase font-black text-center px-12 leading-relaxed">
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
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                const current = paginationMeta.current_page;
                const total = paginationMeta.total_pages;
                
                let startPage = Math.max(1, current - 1);
                let endPage = Math.min(total, current + 1);
                
                if (endPage - startPage < 2 && total >= 3) {
                  if (startPage === 1) {
                    endPage = 3;
                  } else if (endPage === total) {
                    startPage = total - 2;
                  }
                }
                
                if (p >= startPage && p <= endPage) {
                   return (
                    <button
                      key={p}
                      onClick={() => onPageChange?.(p)}
                      className={`w-8 h-8 rounded-lg font-black text-[0.6875rem] transition-all duration-300 flex items-center justify-center ${
                        current === p 
                          ? 'bg-[#C69C3D] text-white shadow-sm' 
                          : 'bg-transparent text-[#6B6865]/60 hover:text-[#282524] hover:bg-[#2C2A29]/5'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button 
              disabled={!paginationMeta.has_more}
              onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
            >
              Next
            </button>
          </div>
          
          {/* Subtle Metadata */}
          <div className="flex items-center gap-3 opacity-40">
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">
               Page {paginationMeta.current_page} / {paginationMeta.total_pages}
             </span>
             <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">
               {paginationMeta.total_records} Projects
             </span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
