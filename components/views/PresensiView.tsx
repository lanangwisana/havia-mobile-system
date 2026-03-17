import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, MapPin, LogIn, LogOut } from 'lucide-react';
import { colors } from '@/lib/utils';

interface PresensiViewProps {
  onNav: (view: string) => void;
  currentTime: string;
  handleAddAttendance: () => void;
  handleResetAttendance: () => void;
  isSubmittingAttendance: boolean;
  activeAttendance?: any;
  lastFinishedAttendance?: any;
}

export const PresensiView: React.FC<PresensiViewProps> = ({
  onNav, currentTime, handleAddAttendance, handleResetAttendance, isSubmittingAttendance, activeAttendance, lastFinishedAttendance
}) => {
  const isClockedIn = !!activeAttendance;
  const [showFinishedTime, setShowFinishedTime] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef(0);
  
  // Efek untuk memunculkan jam pulang sementara (5 detik) saat baru saja clock out
  useEffect(() => {
    if (!isClockedIn && lastFinishedAttendance?.out_time) {
      setShowFinishedTime(true);
      const timer = setTimeout(() => {
        setShowFinishedTime(false);
      }, 5000); // 5 detik
      return () => clearTimeout(timer);
    }
  }, [isClockedIn, lastFinishedAttendance?.id, lastFinishedAttendance?.out_time]);

  // Format waktu untuk tampilan kecil di kartu bawah (konversi UTC ke Local)
  const getClockTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr || 
        dateTimeStr === '0000-00-00 00:00:00' || 
        dateTimeStr.startsWith('-0001') || 
        dateTimeStr.startsWith('0000')) return '--:--';
    try {
      const date = new Date(dateTimeStr.replace(' ', 'T') + 'Z');
      if (isNaN(date.getTime())) return '--:--';
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '--:--';
    }
  };

  // Touch handlers for "Swap" (Swipe up/down)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 50) setIsExpanded(true); // Swipe UP
    if (diff < -50) setIsExpanded(false); // Swipe DOWN
  };

  return (
    <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      <div className="px-6 py-6 flex items-center justify-between z-20">
        <button onClick={() => onNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-neutral-100 transition-colors shadow-md">
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-900">Attendance</h2>
        <div className="w-10"></div>
      </div>

      {/* Radar Background */}
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-white overflow-hidden z-0 border-b border-[#C69C3D]/20 transition-opacity duration-500 ${isExpanded ? 'opacity-30' : 'opacity-100'}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #C69C3D 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F5F5F5]"></div>
        
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-40 h-40 border border-[#C69C3D]/30 rounded-full absolute"></div>
          <div className="w-24 h-24 bg-[#C69C3D]/20 rounded-full animate-radar absolute"></div>
          <div style={{ backgroundColor: colors.gold }} className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_rgba(212,175,55,0.4)] relative z-10"></div>
          <div className="absolute top-8 bg-neutral-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl tracking-wider">
            LOCATION DETECTED
          </div>
        </div>
      </div>

      <div className="flex-1 z-10 flex flex-col justify-end">
        {/* Bottom Sheet Card */}
        <div 
          style={{ 
            backgroundColor: colors.card,
            height: isExpanded ? '85%' : '65%',
            transform: isExpanded ? 'translateY(0)' : 'translateY(0)' 
          }} 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-neutral-200 relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
        >
          {/* Handle bar */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-8 absolute top-4 left-1/2 transform -translate-x-1/2 cursor-pointer active:bg-neutral-500"
          ></div>
          
          <div className="text-center mb-10 mt-2">
            <h1 className="text-5xl font-light font-mono tracking-tighter text-neutral-900 mb-2">{currentTime || '00:00:00'}</h1>
            
            <div className={`mt-5 inline-flex items-center gap-2 px-4 py-1.5 ${isClockedIn ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'} rounded-full text-[10px] font-bold border tracking-wider`}>
              <MapPin className="w-3 h-3" />
              <span>{isClockedIn ? 'Work Time' : 'Not Clocked In'}</span>
            </div>
          </div>

          <div 
            style={{ 
              background: isClockedIn 
                ? 'linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, rgba(244, 63, 94, 0.03) 100%)' 
                : 'linear-gradient(180deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)',
              borderColor: isClockedIn ? '#F43F5E40' : 'rgba(34, 197, 94, 0.3)' 
            }} 
            className="w-full p-4 rounded-2xl border-2 flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClockedIn ? 'bg-rose-500' : 'bg-green-500'}`}>
                 <Clock className="w-6 h-6 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-neutral-900 font-medium tracking-wide">
                   {isClockedIn ? 'You are clocked in' : 'You are clocked out'}
                 </span>
                 <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                   {isClockedIn ? 'Silahkan Clock Out' : 'Silahkan Clock In'}
                 </span>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddAttendance} 
                disabled={isSubmittingAttendance}
                style={{ 
                  borderColor: isClockedIn ? '#F43F5E' : '#22C55E', 
                  color: isClockedIn ? '#F43F5E' : '#22C55E' 
                }}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-[1.5px] rounded-lg transition-all active:scale-95 ${isSubmittingAttendance ? 'opacity-70 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
              >
                {isSubmittingAttendance ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isClockedIn ? <LogOut className="w-4 h-4 ml-[-2px]" /> : <LogIn className="w-4 h-4 ml-[-2px]" />
                )}
                <span className="text-xs font-bold whitespace-nowrap tracking-wide">
                  {isSubmittingAttendance ? 'PROCESS' : (isClockedIn ? 'Clock Out' : 'Clock In')}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div 
              style={{ 
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
                borderColor: colors.border 
              }} 
              className={`p-4 rounded-xl border ${!isClockedIn && !showFinishedTime && 'opacity-50'}`}
            >
              <div className="flex items-center gap-2 mb-3 text-green-600">
                <LogIn className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">In</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{getClockTime(activeAttendance?.in_time || (showFinishedTime ? lastFinishedAttendance?.in_time : null))}</p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">Clock In Time</p>
            </div>
            <div 
              style={{ 
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
                borderColor: colors.border 
              }} 
              className={`p-4 rounded-xl border ${!showFinishedTime && 'opacity-50'}`}
            >
              <div className="flex items-center gap-2 mb-3 text-rose-600">
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Out</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{showFinishedTime ? getClockTime(lastFinishedAttendance?.out_time) : '--:--'}</p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">Clock Out Time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
