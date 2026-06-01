import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Activity, Clock, Plus, Tag, ChevronRight, User, ChevronDown, AlignLeft, CalendarCheck2, CalendarClock, List } from 'lucide-react';
import { colors } from '@/lib/utils';

interface JadwalContentProps {
  isLoadingEvents: boolean;
  events: any[];
  onEventClick?: (event: any) => void;
  onCreateEvent: () => void;
  // New filtering props
  labels: any[];
  filterType: string;
  setFilterType: (type: string) => void;
  filterLabel: string;
  setFilterLabel: (label: string) => void;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
}

export const JadwalContent: React.FC<JadwalContentProps> = ({
  isLoadingEvents, events, onEventClick, onCreateEvent,
  labels, filterType, setFilterType, filterLabel, setFilterLabel,
  paginationMeta, onPageChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters = [
    { id: 'event', label: 'EVENTS ONLY', icon: Calendar },
    { id: 'all', label: 'ALL SCHEDULES', icon: List },
    { id: 'task_start_date', label: 'TASK START DATE', icon: AlignLeft },
    { id: 'task_deadline', label: 'TASK DEADLINE', icon: CalendarCheck2 },
    { id: 'project_start_date', label: 'PROJECT START DATE', icon: Clock },
    { id: 'project_deadline', label: 'PROJECT DEADLINE', icon: CalendarClock },
  ];

  const activeFilterObj = filters.find(f => f.id === filterType) || filters[0];

  return (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Havia Events</h3>
          <p className="text-[0.625rem] text-neutral-400 uppercase tracking-widest font-bold">Internal Events</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Filter Dropdown */}
      {!isLoadingEvents && (
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
                <span className="text-[0.5625rem] text-[#6B6865] uppercase tracking-widest font-black">Filter Status</span>
                <span className="text-[0.8125rem] font-bold text-[#2C2A29] tracking-tight uppercase max-w-[150px] truncate">{activeFilterObj.label}</span>
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
                      setFilterType(f.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all ${
                      filterType === f.id 
                        ? 'bg-[#C69C3D] text-white' 
                        : 'hover:bg-[#F4EBD4]/30 text-[#6B6865]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${filterType === f.id ? 'bg-white/20' : 'bg-neutral-100'}`}>
                      <f.icon className={`w-4 h-4 ${filterType === f.id ? 'text-white' : 'text-[#C69C3D]'}`} />
                    </div>
                    <span className="text-[0.6875rem] font-bold tracking-widest uppercase text-left break-words">
                      {f.label}
                    </span>
                    {filterType === f.id && (
                      <div className="ml-auto w-2 h-2 shrink-0 rounded-full bg-white animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Backdrop */}
          {isDropdownOpen && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsDropdownOpen(false)}></div>
          )}
        </div>
      )}
    </div>

    {isLoadingEvents ? (
      <div className="flex flex-col items-center justify-center py-20">
         <Activity className="w-10 h-10 text-[#C69C3D] animate-pulse mb-4" />
         <p className="text-[0.625rem] text-neutral-400 uppercase tracking-[0.2em] font-black">Syncing Events...</p>
      </div>
    ) : events.length > 0 ? (
      <div className="space-y-4">
        {events.map((event, index) => {
          const date = new Date(event.start_date || '');
          const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const day = date.getDate();

          // Helper for badges
          const getBadge = (source: string) => {
            if (source?.startsWith('task')) return { label: 'Task', color: '#3498db', bg: 'bg-[#3498db]/10' };
            if (source?.startsWith('project')) return { label: 'Project', color: '#2ecc71', bg: 'bg-[#2ecc71]/10' };
            return { label: 'Event', color: '#C69C3D', bg: 'bg-[#C69C3D]/10' };
          };
          const badge = getBadge(event.event_source);
          
          return (
            <div 
              key={event.id || index} 
              className="bg-white p-4 rounded-2xl border border-[#E8E4E1] shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 shrink-0">
                  <span className="text-[0.5625rem] font-black text-[#C69C3D] tracking-tighter">{month}</span>
                  <span className="text-lg font-black text-neutral-900 leading-none">{day}</span>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="font-bold text-[0.875rem] text-neutral-900 truncate leading-tight">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className={`px-1.5 py-0.5 rounded-[6px] ${badge.bg} border border-neutral-100 shrink-0 flex items-center justify-center`}>
                      <span className="text-[0.5rem] font-black uppercase tracking-widest leading-none" style={{ color: badge.color }}>{badge.label}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        <span className="text-[0.625rem] text-neutral-500 font-bold truncate max-w-[120px]">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E8E4E1]">
                <div className="flex items-center justify-between w-full gap-2 overflow-hidden">
                  <div className="flex items-center gap-1 opacity-80 shrink-0">
                    <Clock className="w-3 h-3 text-[#6B6865]" />
                    <span className="text-[0.6rem] font-bold text-[#6B6865] tracking-wide whitespace-nowrap">
                      Time: <span className="text-[#2C2A29] ml-0.5">{event.start_time || '08:00'} - {event.end_time || '17:00'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 min-w-0">
                    <User className="w-3 h-3 text-[#6B6865] shrink-0" />
                    <span className="text-[0.6rem] font-bold text-[#6B6865] tracking-wide whitespace-nowrap shrink-0">
                      PIC: 
                    </span>
                    <span className="text-[0.6rem] font-bold text-[#2C2A29] ml-0.5 truncate min-w-0">
                      {event.created_by_name || 'Havia Staff'}
                    </span>
                  </div>
                </div>
                {event.description && (
                  <p className="text-[0.75rem] text-neutral-500 leading-relaxed font-medium mt-1 line-clamp-2">
                    {event.description.replace(/(<([^>]+)>)/gi, "")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-neutral-50 rounded-[2rem] border border-neutral-200 border-dashed">
        <Calendar className="w-12 h-12 text-neutral-300 mb-4 opacity-50" />
        <h4 className="text-neutral-900 font-bold text-sm mb-1">Empty Agenda</h4>
        <p className="text-[0.625rem] text-neutral-400 tracking-widest uppercase font-bold text-center leading-relaxed">No schedule planned for you yet.</p>
      </div>
    )}

    {/* Pagination UI */}
    {!isLoadingEvents && paginationMeta && paginationMeta.total_pages > 1 && (
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
                    className={`w-8 h-8 rounded-xl font-black text-[0.6875rem] transition-all active:scale-95 flex items-center justify-center ${
                      current === p 
                        ? 'bg-[#C69C3D] text-white shadow-md' 
                        : 'text-[#6B6865] hover:bg-[#F4EBD4]/50'
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
            disabled={paginationMeta.current_page >= paginationMeta.total_pages}
            onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
            className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#C69C3D] text-white shadow-md"
          >Next</button>
        </div>
      </div>
    )}
  </div>
  );
};
