import React from 'react';
import { Activity, Bell, Calendar, Briefcase, Info } from 'lucide-react';
import { colors } from '@/lib/utils';

interface NotifikasiContentProps {
  isLoadingNotif: boolean;
  notifications: any[];
  onProjectClick: (id: string, name: string, taskId?: string | null) => void;
  onNav: (view: string, nav?: string | null, title?: string) => void;
}

export const NotifikasiContent: React.FC<NotifikasiContentProps> = ({
  isLoadingNotif, notifications, onProjectClick, onNav
}) => {
  const handleItemClick = (notif: any) => {
    if (notif.module === 'project') {
      onProjectClick(notif.target_id, notif.project_title || 'Project Detail');
    } else if (notif.module === 'task') {
      if (notif.project_id) {
        onProjectClick(notif.project_id, notif.project_title || 'Project Tasks', notif.target_id);
      } else {
        onNav('subpage', null, 'All Tasks');
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      {isLoadingNotif ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-10 h-10 rounded-full border-t-2 border-[#C69C3D] animate-spin mb-4"></div>
           <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Scanning System...</p>
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((notif: any, index: number) => {
          const isUrgent = notif.severity === 'urgent';
          const accentColor = isUrgent ? 'bg-red-500' : 'bg-[#C69C3D]';
          
          return (
            <div key={notif.id || index} 
              onClick={() => handleItemClick(notif)}
              className="p-5 rounded-2xl bg-white border border-[#E8E4E1] flex gap-5 active:scale-[0.98] transition-all duration-300 cursor-pointer relative group shadow-sm hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 duration-500 ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-[#F4EBD4]/30 border-[#E8E4E1]'}`}>
                {notif.type === 'deadline' ? (
                  <Calendar className={`w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-[#C69C3D]'}`} />
                ) : notif.module === 'project' ? (
                  <Briefcase className="w-5 h-5 text-[#C69C3D]" />
                ) : (
                  <Bell className="w-5 h-5 text-[#C69C3D]" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-black text-[14px] leading-tight ${isUrgent ? 'text-red-600' : 'text-[#2C2A29]'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-[#6B6865] font-black uppercase tracking-tighter opacity-60">
                    {notif.date ? new Date(notif.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6865] leading-relaxed font-medium line-clamp-2">
                  {notif.message}
                </p>
                
                <div className="pt-2 flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-3 rounded-full ${accentColor}`}></div>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isUrgent ? 'bg-red-50 text-red-500' : 'bg-gold/10 text-gold'}`}>
                          {notif.module}
                      </span>
                   </div>
                   <div className="h-3 w-[1px] bg-neutral-200"></div>
                   <span className="text-[10px] text-gold font-black group-hover:translate-x-1 transition-transform">View Details →</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <div className="w-16 h-16 rounded-[2rem] border border-dashed border-[#6B6865] flex items-center justify-center mb-6">
            <Info className="w-8 h-8 text-[#6B6865]" />
          </div>
          <p className="text-[10px] text-[#2C2A29] font-black uppercase tracking-[0.3em]">No Active Alerts</p>
          <p className="text-[9px] text-[#6B6865] font-medium mt-2">Your workspace is all clear</p>
        </div>
      )}
    </div>
  );
};
