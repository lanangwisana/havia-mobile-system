import React, { useState } from 'react';
import { Activity, Briefcase, User, Clock, Filter, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { colors, formatDate } from '@/lib/utils';

interface ProjectContentProps {
  isLoadingProjects: boolean;
  projects: any[];
  onProjectClick: (id: string, name: string) => void;
}

export const ProjectContent: React.FC<ProjectContentProps> = ({
  isLoadingProjects, projects, onProjectClick
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = [
    { id: 'ALL', label: 'ALL', icon: Filter },
    { id: 'OPEN', label: 'OPEN', icon: Activity },
    { id: 'HOLD', label: 'HOLD', icon: Clock },
    { id: 'CANCELED', label: 'CANCELED', icon: XCircle },
    { id: 'COMPLETED', label: 'DONE', icon: CheckCircle2 },
  ];

  const getProjectCategory = (p: any) => {
    const s = String(p.status || '').toUpperCase().trim();
    const st = String(p.status_title || '').toUpperCase().trim();
    
    if (s === 'COMPLETED' || s === 'DONE' || st === 'COMPLETED' || st === 'DONE' || st === 'SELESAI') return 'COMPLETED';
    if (s === 'CANCELED' || st === 'CANCELED' || st === 'BATAL') return 'CANCELED';
    if (s === 'HOLD' || st === 'HOLD') return 'HOLD';
    if (s === 'OPEN' || st === 'OPEN' || st === 'AKTIF') return 'OPEN';
    
    return 'OPEN'; // Fallback for active projects
  };

  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'ALL') return true;
    return getProjectCategory(project) === activeFilter;
  }).sort((a, b) => {
    if (activeFilter !== 'ALL') return 0;
    
    const categoryToPriority: Record<string, number> = {
      'OPEN': 1,
      'HOLD': 2,
      'CANCELED': 3,
      'COMPLETED': 4
    };
    
    return (categoryToPriority[getProjectCategory(a)] || 5) - (categoryToPriority[getProjectCategory(b)] || 5);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      {/* Filter Bar */}
      {!isLoadingProjects && projects.length > 0 && (
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
      )}

      <div className="px-1 space-y-4">
      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-[2.5rem] border border-neutral-100">
           <div className="w-16 h-16 rounded-full bg-[#C69C3D]/10 flex items-center justify-center mb-4">
               <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Syncing Projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        filteredProjects.map((project: any, index: number) => {
            const totalPoints = parseFloat(project.total_points || "0");
            const completedPoints = parseFloat(project.completed_points || "0");
            const progress = project.progress ? parseInt(project.progress, 10) : (totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0);
            
            const category = getProjectCategory(project);
            const isDone = category === 'COMPLETED';
            const isHold = category === 'HOLD';
            const isCanceled = category === 'CANCELED';
            const isOpen = category === 'OPEN';

            const statusText = project.status_title || project.status || (isDone ? 'COMPLETED' : 'IN PROGRESS');
            
             return (
             <div 
               key={project.id || index} 
               onClick={() => onProjectClick(project.id, project.title)}
               className="group relative rounded-[2rem] p-0.5 overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl mb-4"
               style={{ background: 'linear-gradient(145deg, #F0F0F0, transparent)' }}
             >
               <div className="bg-white rounded-[1.95rem] p-6 h-full relative overflow-hidden border border-neutral-100 shadow-xl">
                 {/* Glow effect on hover */}
                 <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                   isDone ? 'from-green-500/5' : isOpen ? 'from-[#C69C3D]/5' : isHold ? 'from-orange-500/5' : 'from-red-500/5'
                 }`}></div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start gap-3 mb-6">
                    <div className="flex gap-4 items-center min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center border-2 shrink-0 transition-colors duration-500 ${
                        isDone 
                          ? 'bg-green-500/10 border-green-500/20 text-green-600' 
                          : isHold
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                            : isCanceled
                              ? 'bg-red-500/10 border-red-500/20 text-red-600'
                              : 'bg-[#C69C3D]/10 border-[#C69C3D]/20 text-[#C69C3D]'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : isCanceled ? <XCircle className="w-6 h-6" /> : isHold ? <Clock className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className={`font-bold text-[16px] leading-tight transition-all duration-500 ${isDone ? 'text-green-600/60' : 'text-neutral-900'}`}>
                          {project.title || `Project ${project.id}`}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                           <p className="text-[11px] text-neutral-600 flex items-center gap-1.5 font-bold tracking-tight truncate max-w-[180px]">
                             <User className="w-3 h-3 text-[#C69C3D] shrink-0" /> {project.company_name || 'Client Internal'}
                           </p>
                        </div>
                        
                        {/* Status & Role Labels Inline */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {project.userRole && (
                              <span className={`text-[8px] px-2 py-0.8 rounded-lg font-black uppercase tracking-widest border shrink-0 ${
                                project.userRole === 'PIC' 
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]' 
                                  : project.userRole === 'KOLABORATOR'
                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                    : project.userRole === 'MEMBER' || project.userRole === 'TEAM MEMBER'
                                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                      : project.userRole === 'ADMIN'
                                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                        : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                              }`}>
                                {project.userRole === 'MEMBER' ? 'TEAM MEMBER' : project.userRole}
                              </span>
                           )}
                           <span className={`text-[8px] px-2 py-0.8 rounded-lg font-black uppercase tracking-widest border-2 shrink-0 transition-colors duration-500 ${
                             isDone 
                               ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                               : isHold
                                 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                                 : isCanceled
                                   ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                   : 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20'
                           }`}>
                             {statusText.toUpperCase()}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Meta: Dates with Horizontal Timeline */}
                  <div className="pt-6 mt-2 border-t border-neutral-100 flex items-center justify-between gap-3 mb-6">
                    <div className="space-y-1 flex-shrink-0">
                      <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] font-black">Start</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <p className="text-[10px] text-neutral-900 font-bold tracking-tight whitespace-nowrap">{formatDate(project.start_date)}</p>
                      </div>
                    </div>

                    {/* Visual Timeline Bar (Centered between dates) */}
                    <div className="flex-1 flex items-center gap-1.5 px-2 opacity-80">
                      <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                      <div className="flex-1 h-px border-t-[1.5px] border-dashed border-black"></div>
                      <div className="w-1 h-1 rounded-full bg-black/40"></div>
                      <div className="flex-1 h-px border-t-[1.5px] border-dashed border-black"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/80"></div>
                    </div>

                    <div className="space-y-1 text-right flex-shrink-0">
                      <p className="text-[8px] text-red-500 uppercase tracking-[0.2em] font-black">Deadline</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className="w-3 h-3 text-red-400" />
                        <p className="text-[10px] text-neutral-900 font-bold tracking-tight whitespace-nowrap">{formatDate(project.deadline)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.15em] font-black">
                      <p className="text-neutral-400">Project Progress</p>
                      <p className={isDone ? 'text-green-600' : 'text-[#C69C3D]'}>{progress}%</p>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden p-[1px]">
                      <div 
                         style={{ width: `${progress}%` }} 
                         className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(198,156,61,0.2)] ${
                           isDone ? 'bg-green-500' : 'bg-gradient-to-r from-[#C69C3D] to-[#E5C16C]'
                         }`}
                      ></div>
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
      </div>
    </div>
  );
};
