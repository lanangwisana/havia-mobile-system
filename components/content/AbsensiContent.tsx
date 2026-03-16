import React from 'react';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { colors } from '@/lib/utils';

interface AbsensiContentProps {
  attendances: any[];
  isLoadingAttendances: boolean;
}

export const AbsensiContent: React.FC<AbsensiContentProps> = ({
  attendances, isLoadingAttendances
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
    <div className="flex items-center justify-between mb-4 pl-1">
      <h3 className="text-sm font-bold text-neutral-900 tracking-wide">Attendance History</h3>
      <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{attendances.length} Items</span>
    </div>

    {isLoadingAttendances ? (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading Attendance History...</p>
      </div>
    ) : attendances.length > 0 ? (
      <div className="space-y-4">
        {attendances.map((att: any, idx: number) => {
          const dateObj = new Date(att.date || (att.in_time ? att.in_time.split(' ')[0] : new Date().toISOString()));
          const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          
          const formatLocalTime = (utcStr: string | null) => {
            if (!utcStr || utcStr.startsWith('0000') || utcStr.startsWith('-0001')) return '--:--';
            try {
              const date = new Date(utcStr.replace(' ', 'T') + 'Z');
              if (isNaN(date.getTime())) return utcStr;
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            } catch (e) {
              return '--:--';
            }
          };

          return (
            <div key={att.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm mb-1">{displayDate}</h4>
                  {att.note && <p className="text-[10px] text-neutral-400 italic">Note: {att.note}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                    <LogIn className="w-3 h-3 text-green-600" /> In
                  </span>
                  <span className="text-sm font-mono font-bold text-neutral-900 group-hover:text-[#C69C3D] transition-colors">
                    {formatLocalTime(att.in_time)}
                  </span>
                </div>
                <div className="flex flex-col pl-4 border-l border-neutral-100">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                    <LogOut className="w-3 h-3 text-rose-600" /> Out
                  </span>
                  <span className="text-sm font-mono font-bold text-neutral-500">
                    {formatLocalTime(att.out_time)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed">
        <Clock className="w-12 h-12 text-neutral-300 mb-4" />
        <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold text-center px-8">No attendance history<br/>yet</p>
      </div>
    )}
  </div>
);
