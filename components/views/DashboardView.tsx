import React from 'react';
import { Bell, QrCode, ClipboardList, Users, DollarSign, Calendar, Briefcase, Clock } from 'lucide-react';
import { colors, getGreeting, getUserImage, getAttendanceStatus } from '@/lib/utils';
import { getVisibleMenuItems, isAdmin } from '@/lib/permissions';

interface DashboardViewProps {
  userData: any;
  currentTime: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  activeAttendance?: any;
  notifications?: any[];
  unreadNotifCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userData, currentTime, onNav, activeAttendance, notifications, unreadNotifCount = 0 }) => {
  let timeWarningText = null;
  if (currentTime) {
    const [hStr, mStr] = currentTime.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    
    if (h === 11 && m >= 45) {
      timeWarningText = "15 menit lagi menuju jam istirahat";
    } else if (h === 16 && m >= 45) {
      timeWarningText = "15 menit sebelum clock out";
    }
  }

  const displayName = userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : (userData?.name || 'User');
  let nameSizeClass = "text-[1.35rem]";
  if (displayName.length > 20) nameSizeClass = "text-[1rem]";
  else if (displayName.length > 14) nameSizeClass = "text-[1.15rem]";

  const displayRole = userData?.role_title || userData?.job_title || 'TEAM MEMBER';
  let roleSizeClass = "text-[0.625rem]";
  if (displayRole.length > 25) roleSizeClass = "text-[0.45rem]";
  else if (displayRole.length > 15) roleSizeClass = "text-[0.55rem]";

  return (
    <section className="h-full w-full flex flex-col relative overflow-y-auto scrollbar-hide pb-28 animate-in fade-in duration-300">
      {/* Header with Logo */}
      <div style={{ backgroundColor: `${colors.primary}FA` }} className="px-6 pt-12 pb-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 border-b border-neutral-200/50">
        <div className="flex items-center gap-4">
          <img src="/LogoHavia_primary1.png" className="h-5 w-auto object-contain" alt="Havia Logo" />
          <div className="h-8 w-[1px] bg-neutral-200"></div>
          <div>
            <p style={{ color: colors.gold }} className="text-[0.625rem] uppercase tracking-[0.2em] mb-0.5 font-black">{getGreeting()}</p>
            <h2 className="text-[1rem] font-black text-neutral-900 tracking-tight leading-none">Enjoy your work!</h2>
          </div>
        </div>
        <button onClick={() => onNav('subpage', null, 'Notifications')} style={{ backgroundColor: colors.card }} className="w-10 h-10 rounded-full border border-[#E8E4E1] flex items-center justify-center relative hover:bg-neutral-50 active:scale-95 transition-all">
          <Bell className="w-5 h-5 text-[#6B6865]" />
          {notifications && notifications.length > 0 && (
            <span style={{ backgroundColor: colors.gold }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-[0.625rem] font-black text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>
      </div>

      <div className="px-6 space-y-6 pt-6 flex-1 flex flex-col">
        {/* User Info Card - Premium Rounded Rectangle */}
        <div 
          className="w-full bg-gradient-to-tr from-[#F4EBD4]/90 via-white to-white rounded-2xl relative overflow-hidden transition-all duration-500 flex items-stretch min-h-[6.5rem]"
          style={{ boxShadow: '0 12px 35px -10px rgba(0,0,0,0.08)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#C69C3D]/5 rounded-full blur-[60px] transform translate-x-10 -translate-y-10 group-hover:bg-[#C69C3D]/10 transition-colors"></div>
          
          {/* Bagian Kiri: Nama & Role */}
          <div className="w-[65%] py-6 pl-7 pr-4 flex flex-col justify-center relative z-10 space-y-1.5 text-left">
            <h3 className={`font-black ${nameSizeClass} text-[#2C2A29] leading-none tracking-tight line-clamp-2`}>
              {displayName}
            </h3>
            <p className={`${roleSizeClass} font-black uppercase tracking-[0.25em] text-[#C69C3D] line-clamp-2`}>
              {displayRole}
            </p>
          </div>

          {/* Bagian Kanan: Foto Profil */}
          <div className="w-[35%] relative z-10 bg-neutral-100">
            <img src={getUserImage(userData)} className="absolute inset-0 w-full h-full object-cover object-center" alt="Profile" />
          </div>
        </div>

        {/* Time Widget */}
        <div 
          className="bg-gradient-to-tr from-white to-[#F4EBD4]/5 rounded-[2.5rem] p-6 flex flex-col items-center justify-center border border-[#E8E4E1] transition-all duration-300 overflow-hidden relative"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)' }}>
          
          {activeAttendance && (
            <div className="absolute top-4 right-5">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[0.5rem] font-black border border-green-500/20 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          )}

          <div className="relative z-10 text-center w-full flex flex-col items-center">
            <p className="text-[0.5625rem] text-[#6B6865] uppercase font-black tracking-[0.2em] mb-1.5 opacity-60">
              Live Current Time
            </p>
            <h2 className="text-[2.5rem] font-black text-[#2C2A29] tracking-tighter leading-none">
              {currentTime || '14:20:25'}
            </h2>
            
            {timeWarningText && (
              <p className="text-[0.625rem] font-bold text-[#C69C3D] mt-2 bg-[#F4EBD4]/40 px-3 py-1 rounded-full animate-pulse">
                {timeWarningText}
              </p>
            )}
          </div>
        </div>

        {/* Menu - Permission-Filtered */}
        <div className="pt-2 pb-6 px-1">
          <p className="text-[0.625rem] text-neutral-900 uppercase tracking-[0.3em] font-black mb-3 px-1">Menu</p>
          <div className="grid grid-cols-5 gap-3 h-24">
            {(() => {
              const userIsAdmin = isAdmin(userData);
              const teamLabel = userIsAdmin ? 'Team' : 'Attendance';
              const teamIcon = userIsAdmin ? Users : Clock;

              const allItems = [
                { id: 'My Tasks', label: 'Tasks', icon: ClipboardList },
                { id: 'Project', label: 'Projects', icon: Briefcase, nav: 'project' },
                { id: 'Events', label: 'Events', icon: Calendar, nav: 'jadwal' },
                { id: 'Team', label: teamLabel, icon: teamIcon },
                { id: 'Finance', label: 'Finance', icon: DollarSign }
              ];
              return getVisibleMenuItems(userData, allItems).map((item) => (
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
                  <span className="text-[0.45rem] min-[400px]:text-[0.5rem] font-black tracking-wider text-neutral-900 uppercase w-full text-center leading-tight">{item.label}</span>
                </button>
              ));
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
