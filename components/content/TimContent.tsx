import { Clock, FileText, CalendarRange, Clock3, History, Plus, ChevronRight } from 'lucide-react';
import { colors } from '@/lib/utils';

interface TimContentProps {
  onNav: (view: string, nav?: string | null, title?: string) => void;
  attendances: any[];
  isLoadingAttendances: boolean;
  leaves: any[];
  onOpenLeaveModal?: (type: 'izin' | 'cuti') => void;
}

export const TimContent: React.FC<TimContentProps> = ({ 
  onNav, 
  attendances, 
  isLoadingAttendances, 
  leaves,
  onOpenLeaveModal
}) => {
  // Filter only for today or last few records if needed, but here we show all as "Time Cards"
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between pl-1">
        <h3 className="text-sm font-bold text-neutral-900 tracking-wide">Team & My Attendance</h3>
        <button onClick={() => onNav('subpage', null, 'Attendance')} className="text-[10px] font-bold text-[#C69C3D] uppercase tracking-widest flex items-center gap-1 group">
          <History className="w-3 h-3 transition-transform group-hover:rotate-[-20deg]" /> Full History
        </button>
      </div>
      
      {/* Quick Stats / Summary like Timecards in Brain */}
      <div className="space-y-3">
        {/* Full Width Total Hours */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-5 flex flex-col items-center justify-center shadow-md">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center">Total Work Hours</span>
          <span className="text-3xl font-black text-[#C69C3D] tabular-nums">
            {(() => {
              let totalMs = 0;
              attendances.forEach(att => {
                if (att.in_time && att.out_time && !att.out_time.startsWith('0000') && !att.out_time.startsWith('-0001')) {
                  const cin = new Date(att.in_time.replace(' ', 'T') + 'Z');
                  const cout = new Date(att.out_time.replace(' ', 'T') + 'Z');
                  if (!isNaN(cin.getTime()) && !isNaN(cout.getTime())) {
                    totalMs += (cout.getTime() - cin.getTime());
                  }
                }
              });
              const hours = Math.floor(totalMs / (1000 * 60 * 60));
              const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
              const seconds = Math.floor((totalMs / 1000) % 60);
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            })()}
          </span>
        </div>

        {/* Small Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-neutral-100 rounded-3xl p-4 flex flex-col items-center justify-center shadow-md">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center">Total Work Days</span>
            <span className="text-2xl font-black text-neutral-900 leading-tight">
              {new Set(attendances.map(a => a.date || (a.in_time ? a.in_time.split(' ')[0] : null))).size}
            </span>
          </div>
          <div className="bg-white border border-neutral-100 rounded-3xl p-4 flex flex-col items-center justify-center shadow-md">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center">Leave / Permission</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-neutral-900 leading-tight">
                {leaves.filter(l => l.status === 'approved').reduce((acc, l) => acc + parseFloat(l.total_days || 0), 0)}
              </span>
              <span className="text-[8px] text-neutral-400 font-medium uppercase tracking-widest -mt-1">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Single unified button */}
      <button 
        onClick={() => onOpenLeaveModal?.('izin')}
        className="w-full flex items-center justify-between p-5 bg-white border border-neutral-200 rounded-[2rem] hover:border-[#C69C3D]/30 transition-all group active:scale-[0.98] shadow-md mb-3"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C69C3D]/10 flex items-center justify-center border border-[#C69C3D]/20 group-hover:bg-[#C69C3D]/20 transition-colors">
            <Plus className="w-6 h-6 text-[#C69C3D]" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Create Submission</span>
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest">Leave/ Permission</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
        </div>
      </button>

      {/* History Summary Link */}
      {leaves && leaves.length > 0 && (
        <div className="px-1">
          <button 
            onClick={() => onNav('subpage', null, 'Submission History')}
            className="w-full flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-neutral-200 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center">
                <History className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">View History</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-[#C69C3D] uppercase tracking-widest transition-all">Detail</span>
              <ChevronRight className="w-4 h-4 text-[#C69C3D]" />
            </div>
          </button>
        </div>
      )}

      {/* Time Cards Sections */}
      <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-6 relative overflow-hidden shadow-xl">
         <div className="flex items-center gap-3 mb-6">
           <div className="w-8 h-8 rounded-xl bg-[#C69C3D]/10 flex items-center justify-center border border-[#C69C3D]/20">
             <Clock3 className="w-4 h-4 text-[#C69C3D]" />
           </div>
           <h4 className="text-xs font-black text-neutral-900 uppercase tracking-[0.2em]">Time Card Logs</h4>
         </div>

         {isLoadingAttendances ? (
           <div className="flex flex-col items-center justify-center py-10">
             <div className="w-6 h-6 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
           </div>
         ) : attendances.length > 0 ? (
           <div className="space-y-4">
             {attendances.slice(0, 10).map((att: any, idx: number) => {
                               // Convert UTC from server to Local for display
               const formatLocalTime = (utcStr: string | null) => {
                 if (!utcStr || utcStr.startsWith('0000') || utcStr.startsWith('-0001')) return null;
                 const date = new Date(utcStr.replace(' ', 'T') + 'Z');
                 if (isNaN(date.getTime())) return utcStr;
                                   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
               };

               const inTimeLocal = formatLocalTime(att.in_time);
               const outTimeLocal = formatLocalTime(att.out_time);
               
               const dateObj = new Date(att.in_time ? att.in_time.split(' ')[0] : (att.date || new Date()));
                               const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
               const dayNum = dateObj.getDate();
               
               const isOutTimeEmpty = !att.out_time || 
                                      att.out_time.startsWith('0000') || 
                                      att.out_time.startsWith('-0001');
               const isClockedIn = att.status === 'incomplete' || (att.status === 'pending' && outTimeLocal === null && isOutTimeEmpty);

               // Calculate duration for the card
               let durationText = "";
               if (att.in_time && !isOutTimeEmpty) {
                  const cin = new Date(att.in_time.replace(' ', 'T') + 'Z');
                  const cout = new Date(att.out_time.replace(' ', 'T') + 'Z');
                  const diffMs = cout.getTime() - cin.getTime();
                  const totalSec = Math.floor(diffMs / 1000);
                  
                  if (totalSec < 60) {
                    durationText = `${totalSec}s`; // seconds
                  } else if (totalSec < 3600) {
                    durationText = `${Math.floor(totalSec / 60)}m`; // minutes
                  } else {
                    const h = Math.floor(totalSec / 3600);
                    const m = Math.floor((totalSec % 3600) / 60);
                    durationText = `${h}h ${m}m`; // hours minutes
                  }
               }

               return (
                 <div key={att.id || idx} className="flex items-center gap-4 group">
                    {/* Date Bubble */}
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 shrink-0">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase leading-none mb-0.5">{dayName}</span>
                      <span className="text-xs font-black text-neutral-900 leading-none">{dayNum}</span>
                    </div>

                    {/* Timeline Line */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-neutral-800">
                            {isClockedIn ? 'Working' : 'Work Finished'}
                          </span>
                          {!isClockedIn && durationText && (
                            <span className="text-[8px] text-[#C69C3D] font-bold tracking-tight">Durations: {durationText}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-neutral-400 tabular-nums">
                          {inTimeLocal || '--:--'} - {outTimeLocal || 'Working'}
                        </span>
                      </div>
                      
                      {/* Duration Bar Mock */}
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isClockedIn ? 'bg-[#C69C3D] animate-pulse' : 'bg-green-500/30'}`} 
                          style={{ width: isClockedIn ? '100%' : '100%' }}
                        ></div>
                      </div>
                    </div>
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="py-10 text-center">
             <p className="text-[10px] text-neutral-400 uppercase tracking-widest">No time logs yet.</p>
           </div>
         )}
      </div>
    </div>
  );
};
