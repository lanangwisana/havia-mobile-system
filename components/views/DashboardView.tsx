import React from 'react';
import { Bell, QrCode, ClipboardList, Users, DollarSign, Calendar, Briefcase, Clock } from 'lucide-react';
import { colors, getGreeting, getUserImage, getAttendanceStatus } from '@/lib/utils';

interface DashboardViewProps {
  userData: any;
  currentTime: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  activeAttendance?: any;
  notifications?: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userData, currentTime, onNav, activeAttendance, notifications }) => {
  return (
    <section className="h-full w-full flex flex-col relative overflow-y-auto scrollbar-hide pb-28 animate-in fade-in duration-300">
      {/* Header with Logo */}
      <div style={{ backgroundColor: `${colors.primary}FA` }} className="px-6 pt-12 pb-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 border-b border-neutral-200/50">
        <div className="flex items-center gap-4">
          <img src="/LogoHavia_primary1.png" className="h-5 w-auto object-contain" alt="Havia Logo" />
          <div className="h-8 w-[1px] bg-neutral-200"></div>
          <div>
            <p style={{ color: colors.gold }} className="text-[10px] uppercase tracking-[0.2em] mb-0.5 font-black">{getGreeting()}</p>
            <h2 className="text-[16px] font-black text-neutral-900 tracking-tight leading-none">Enjoy your work!</h2>
          </div>
        </div>
        <button onClick={() => onNav('subpage', null, 'Notifications')} style={{ backgroundColor: colors.card }} className="w-10 h-10 rounded-full border border-[#E8E4E1] flex items-center justify-center relative hover:bg-neutral-50 active:scale-95 transition-all">
          <Bell className="w-5 h-5 text-[#6B6865]" />
          {notifications && notifications.length > 0 && (
            <span style={{ backgroundColor: colors.gold }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-black text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>
      </div>

      <div className="px-6 space-y-6 pt-6 flex-1 flex flex-col">
        {/* ID Card Widget - Premium Gradient & Separation */}
        <div onClick={() => onNav('id', null)} 
          className="w-full bg-gradient-to-br from-white to-[#F4EBD4]/10 rounded-[2.5rem] p-6 relative overflow-hidden border border-[#E8E4E1] active:scale-[0.98] transition-all duration-500 cursor-pointer"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full blur-[60px] transform translate-x-10 -translate-y-10 group-hover:bg-gold/10 transition-colors"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full p-[3px] bg-white border border-[#E8E4E1]">
                <img src={getUserImage(userData)} className="w-full h-full rounded-full object-cover" alt="Profile" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black text-[17px] text-[#2C2A29] leading-tight">
                  {userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}` : (userData?.name || 'User')}
                </h3>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C69C3D]">{userData?.job_title || 'TEAM MEMBER'}</p>
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-[#E8E4E1] shadow-sm">
              <QrCode className="w-6 h-6 text-[#C69C3D]" />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end relative z-10">
            <div>
              <p className="text-[8px] text-[#6B6865] uppercase tracking-[0.2em] mb-1 font-black">Company</p>
              <p className="text-[10px] font-black text-[#6B6865] tracking-wide">HAVIA STUDIO & GAMPAWORKS</p>
            </div>
          </div>
        </div>

        {/* Time Widget - Clickable to clock-in */}
        <div 
          onClick={() => onNav('presensi', 'presensi')}
          className="bg-gradient-to-tr from-white to-[#F4EBD4]/5 rounded-[2.5rem] p-6 flex justify-between items-center border border-[#E8E4E1] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden relative"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)' }}>
          <div className="relative z-10">
            <p className="text-[9px] text-[#6B6865] uppercase font-black tracking-[0.2em] mb-1.5 opacity-60">Live Current Time</p>
            <div className="flex items-baseline gap-2">
               <h2 className="text-[34px] font-black text-[#2C2A29] tracking-tighter leading-none">{currentTime || '14:20:25'}</h2>
               <span className="text-[10px] font-black text-[#C69C3D] bg-[#F4EBD4]/40 px-2 py-0.5 rounded-md">WIB</span>
            </div>
          </div>
          <div className="relative z-10 text-right flex flex-col items-end gap-3 translate-y-1">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8E4E1] shadow-sm transition-transform duration-500 hover:rotate-6">
              <Clock className="w-6 h-6 text-[#C69C3D]" />
            </div>
            {activeAttendance && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[8px] font-black border border-green-500/20 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Quick Access Menu - 5 Columns with Abstract 3D Icons & Transparency Fix */}
        <div className="pt-2 pb-6 px-1">
          <p className="text-[10px] text-neutral-900 uppercase tracking-[0.3em] font-black mb-6 px-1">Quick Access</p>
          <div className="grid grid-cols-5 gap-3 h-24">
            {[
              { id: 'All Tasks', label: 'Tasks', icon: ClipboardList },
              { id: 'Project', label: 'Projects', icon: Briefcase, nav: 'project' },
              { id: 'Schedule', label: 'Events', icon: Calendar, nav: 'jadwal' },
              { id: 'Team', label: 'Team', icon: Users },
              { id: 'Finance', label: 'Finance', icon: DollarSign }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => onNav('subpage', item.nav || null, item.id)} 
                className="flex flex-col items-center gap-3 active:scale-95 transition-all duration-300 w-full"
              >
                <div 
                   className="w-full aspect-square rounded-[1.8rem] border border-[#E8E4E1] flex items-center justify-center relative bg-white overflow-hidden shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-[#F4EBD4]/20 opacity-50"></div>
                  <item.icon className="w-6 h-6 text-[#C69C3D] relative z-10" />
                </div>
                <span className="text-[8px] font-black tracking-widest text-neutral-900 uppercase truncate w-full text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
