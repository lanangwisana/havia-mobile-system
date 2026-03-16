import React from 'react';
import { Bell, QrCode, ClipboardList, Users, DollarSign, Calendar, Briefcase, Clock } from 'lucide-react';
import { colors, getGreeting, getUserImage, getAttendanceStatus } from '@/lib/utils';

interface DashboardViewProps {
  userData: any;
  currentTime: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  activeAttendance?: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userData, currentTime, onNav, activeAttendance }) => {
  return (
    <section className="h-full w-full flex flex-col relative overflow-y-auto scrollbar-hide pb-28 animate-in fade-in duration-300">
      <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 pt-12 pb-6 flex justify-between items-center backdrop-blur-md sticky top-0 z-30 border-b border-neutral-200/50">
        <div>
          <p style={{ color: colors.gold }} className="text-[10px] uppercase tracking-widest mb-1 font-bold">{getGreeting()}, {userData?.first_name || userData?.name || 'User'}</p>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">Enjoy your work! 🚀</h2>
        </div>
        <button onClick={() => onNav('subpage', null, 'Notifications')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center relative hover:bg-neutral-100 transition-colors">
          <Bell className="w-5 h-5 text-neutral-400" />
          <span style={{ backgroundColor: colors.gold }} className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
        </button>
      </div>

      <div className="px-6 space-y-6 pt-6 flex-1 flex flex-col">
        {/* ID Card Widget */}
        <div onClick={() => onNav('id', null)} className="w-full bg-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-neutral-200 active:scale-[0.98] transition-all cursor-pointer group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-gold/10 transition-colors"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-gold/50 p-1">
                <img src={getUserImage(userData)} className="w-full h-full rounded-full object-cover transition-all duration-500" alt="Profile" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-dark tracking-wide">
                  {userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}` : (userData?.name || 'User')}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest mt-0.5 text-gold">{userData?.job_title || 'TEAM MEMBER'}</p>
              </div>
            </div>
            <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
              <QrCode className="w-5 h-5 text-gold" />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end relative z-10">
            <div>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 font-bold">Company</p>
              <p className="text-[10px] font-bold text-neutral-500 tracking-wider">HAVIA STUDIO & GAMPAWORKS</p>
            </div>
          </div>
        </div>


        {/* Time Widget */}
        <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-3xl p-5 flex justify-between items-center border">
          <div>
            <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest mb-1">Current Time</p>
            <h2 className="text-3xl font-light text-neutral-900 font-mono tracking-tighter">{currentTime || '14:20:25'}</h2>
            <span className="text-[10px] text-neutral-400 font-medium">WIB / Western Indonesia</span>
          </div>
          <div className="text-right border-l border-neutral-200 pl-4 flex flex-col items-end gap-2">
            <Clock className="w-6 h-6 text-neutral-600" />
            {activeAttendance && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-md text-[8px] font-black border border-green-500/20 uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 pb-6">
          <div className="grid grid-cols-3 gap-x-4 content-center">
            {[
              { id: 'All Tasks', label: 'Task', icon: ClipboardList },
              { id: 'Team', label: 'Team', icon: Users },
              { id: 'Finance', label: 'Finance', icon: DollarSign }
            ].map((item) => (
              <button key={item.id} onClick={() => onNav('subpage', null, item.id)} className="flex flex-col items-center gap-3 group active:scale-95 transition-transform w-full">
                <div className="w-full aspect-square btn-3d flex items-center justify-center group-hover:border-[#C69C3D] group-active:border-[#C69C3D] transition-all duration-300">
                  <item.icon className="w-8 h-8 text-neutral-400 group-hover:text-[#C69C3D] group-active:text-[#C69C3D] transition-colors drop-shadow-md" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-neutral-600 group-hover:text-black group-active:text-[#C69C3D] transition-colors uppercase">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
