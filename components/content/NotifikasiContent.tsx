import React from 'react';
import { Activity, Bell } from 'lucide-react';
import { colors } from '@/lib/utils';

interface NotifikasiContentProps {
  isLoadingNotif: boolean;
  notifications: any[];
}

export const NotifikasiContent: React.FC<NotifikasiContentProps> = ({
  isLoadingNotif, notifications
}) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
    <div className="flex items-center justify-between mb-4 pl-1">
      <h3 className="text-sm font-bold text-neutral-900 tracking-wide">Notifications</h3>
      <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80">Mark as Read</span>
    </div>

    {isLoadingNotif ? (
      <div className="flex flex-col items-center justify-center py-10">
         <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
         <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading Data...</p>
      </div>
    ) : notifications.length > 0 ? (
      notifications.map((notif: any, index: number) => (
        <div key={notif.id || index} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border flex gap-4 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group">
          {notif.is_read === "0" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C69C3D]"></div>}
          
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0">
            <Bell className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-bold text-sm ${notif.is_read === "0" ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {notif.event || notif.title || 'Notification'}
              </h4>
              <span className="text-[9px] text-neutral-400 font-medium">
                {notif.created_at ? new Date(notif.created_at).toLocaleDateString('en-US') : ''}
              </span>
            </div>
            <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed mb-1">
              {notif.description || notif.message || 'You have a new notification.'}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-10 opacity-50">
        <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="text-xs text-neutral-400 tracking-widest">NO NOTIFICATIONS</p>
      </div>
    )}
  </div>
);
