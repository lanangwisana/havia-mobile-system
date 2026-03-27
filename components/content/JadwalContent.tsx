import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Activity, Clock, Plus, Tag, ChevronRight, User, ChevronDown, AlignLeft, CalendarCheck2, CalendarClock, List } from 'lucide-react';
import { colors } from '@/lib/utils';

interface JadwalContentProps {
  isLoadingEvents: boolean;
  events: any[];
  onEventClick: (event: any) => void;
  onCreateEvent: () => void;
  // New filtering props
  labels: any[];
  filterType: string;
  setFilterType: (type: string) => void;
  filterLabel: string;
  setFilterLabel: (label: string) => void;
}

export const JadwalContent: React.FC<JadwalContentProps> = ({
  isLoadingEvents, events, onEventClick, onCreateEvent,
  labels, filterType, setFilterType, filterLabel, setFilterLabel
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
              onClick={() => onEventClick(event)} 
              className="group relative p-px rounded-[1.8rem] overflow-hidden active:scale-[0.98] transition-all duration-300 shadow-xl"
              style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent)' }}
            >
              <div className="bg-white p-4 rounded-[1.75rem] relative overflow-hidden border border-neutral-100 shadow-sm transition-all group-active:shadow-none">
                <div className="flex gap-4 relative z-10 items-center">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200 shrink-0 group-hover:bg-[#C69C3D]/10 group-hover:border-[#C69C3D]/20 transition-colors">
                    <span className="text-[0.5625rem] font-black text-[#C69C3D] tracking-tighter">{month}</span>
                    <span className="text-lg font-black text-neutral-900 leading-none">{day}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[0.875rem] text-neutral-900 group-hover:text-[#C69C3D] transition-colors truncate mb-1.5 leading-tight">{event.title}</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span className="text-[0.625rem] text-neutral-400 font-bold">{event.start_time || '08:00'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-500" />
                            <span className="text-[0.625rem] text-neutral-400 font-bold truncate max-w-[100px]">{event.location}</span>
                          </div>
                        )}
                        <div className={`px-1.5 py-0.5 rounded-[6px] ${badge.bg} border border-neutral-100 shrink-0 flex items-center justify-center`}>
                          <span className="text-[0.5rem] font-black uppercase tracking-widest leading-none" style={{ color: badge.color }}>{badge.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 group-hover:text-[#C69C3D] group-hover:bg-[#C69C3D]/5 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
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
  </div>
  );
};

interface EventDetailContentProps {
  selectedEvent: any;
  onBack: () => void;
}

export const EventDetailContent: React.FC<EventDetailContentProps> = ({ selectedEvent, onBack }) => {
  if (!selectedEvent) return null;
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32 px-1">
      {/* Header Banner - Updated to match Image 3 style */}
      <div 
        className="w-full h-44 rounded-[2.5rem] relative overflow-hidden shadow-xl border border-neutral-100"
        style={{ 
          background: 'linear-gradient(145deg, #FFFFFF, #F5F5F5)',
        }}
      >
        {/* Subtle glow accent like in Image 3 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C69C3D]/5 rounded-full blur-[60px] -mr-10 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C69C3D]/5 rounded-full blur-[50px] -ml-10 -mb-20"></div>

        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Calendar className="w-24 h-24 text-white rotate-12" />
        </div>
        
        <div className="absolute inset-x-8 bottom-8 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-[0.5625rem] text-[#C69C3D] font-black uppercase tracking-[0.3em] mb-1">Event Detail</span>
            <h3 className="text-2xl font-black text-neutral-900 leading-tight drop-shadow-md">{selectedEvent.title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-[#C69C3D] rounded-full"></div>
            <span className="text-[0.5rem] text-neutral-400 font-bold uppercase tracking-widest">Internal Events</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-[1.8rem] bg-neutral-50 border border-neutral-100">
             <p className="text-[0.4375rem] text-neutral-400 uppercase tracking-[0.2em] font-black mb-2">Start Time</p>
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-xl bg-[#C69C3D]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#C69C3D]" />
               </div>
               <p className="text-xs font-black text-neutral-900">{selectedEvent.start_time || '08:00'}</p>
             </div>
          </div>
          <div className="p-4 rounded-[1.8rem] bg-neutral-50 border border-neutral-100">
             <p className="text-[0.4375rem] text-neutral-400 uppercase tracking-[0.2em] font-black mb-2">End Time</p>
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-neutral-500" />
               </div>
               <p className="text-xs font-black text-neutral-900">{selectedEvent.end_time || '17:00'}</p>
             </div>
          </div>
        </div>

        <div className="p-5 rounded-[2rem] bg-neutral-50 border border-neutral-100">
           <p className="text-[0.4375rem] text-neutral-400 uppercase tracking-[0.2em] font-black mb-3">Location Information</p>
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#C69C3D]/10 flex items-center justify-center shrink-0">
                 <MapPin className="w-5 h-5 text-[#C69C3D]" />
              </div>
              <p className="text-[0.8125rem] text-neutral-600 leading-relaxed font-bold py-1">{selectedEvent.location || 'Location not yet determined for this agenda.'}</p>
           </div>
        </div>

        {selectedEvent.description && (
          <div className="p-5 rounded-[2rem] bg-neutral-50 border border-neutral-100">
             <p className="text-[0.4375rem] text-neutral-400 uppercase tracking-[0.2em] font-black mb-3">Event Description</p>
             <div className="text-[0.8125rem] text-neutral-500 leading-relaxed font-medium">
               {selectedEvent.description.replace(/(<([^>]+)>)/gi, "")}
             </div>
          </div>
        )}

        <div className="p-5 rounded-[2rem] bg-neutral-50 border border-neutral-100">
           <p className="text-[0.4375rem] text-neutral-400 uppercase tracking-[0.2em] font-black mb-3">PIC / Creator</p>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                 <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-xs font-black text-neutral-900">{selectedEvent.created_by_name || 'Havia Staff'}</p>
                <p className="text-[0.5rem] text-neutral-400 uppercase font-bold tracking-widest">Event Organizer</p>
              </div>
           </div>
        </div>

        
      </div>
    </div>
  );
};
