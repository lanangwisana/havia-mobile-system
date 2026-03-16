import React from 'react';
import { Sparkles } from 'lucide-react';
import { colors } from '@/lib/utils';

interface CreateEventContentProps {
  newEvent: any;
  setNewEvent: (v: any) => void;
  handleCreateEvent: () => void;
  isSavingEvent: boolean;
  onCancel: () => void;
}

export const CreateEventContent: React.FC<CreateEventContentProps> = ({
  newEvent, setNewEvent, handleCreateEvent, isSavingEvent, onCancel
}) => {
  const inputClass = "w-full text-neutral-900 text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-400 transition-all border outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Event Title</label>
        <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Meeting/activity name..." style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Date</label>
          <input type="date" value={newEvent.start_date} onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value, end_date: e.target.value })} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Time</label>
          <input type="time" value={newEvent.start_time} onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Location</label>
        <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Meeting Room / Google Meet..." style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Select Label Color</label>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['#C69C3D', '#F43F5E', '#3B82F6', '#10B981', '#8B5CF6'].map((c) => (
            <div key={c} onClick={() => setNewEvent({ ...newEvent, color: c })} className={`w-10 h-10 rounded-full cursor-pointer shrink-0 border-2 transition-all ${newEvent.color === c ? 'border-neutral-900 scale-110' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <button onClick={handleCreateEvent} disabled={isSavingEvent}
          className={`w-full gold-gradient text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSavingEvent ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <Sparkles className={`w-5 h-5 ${isSavingEvent ? 'animate-pulse' : ''}`} />
          <span className="uppercase tracking-widest text-xs">{isSavingEvent ? 'SAVING...' : 'Create Event'}</span>
        </button>
        <button onClick={onCancel} className="w-full py-3 rounded-xl border border-neutral-100 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-200 transition-all active:scale-[0.98]">
          Cancel
        </button>
      </div>
    </div>
  );
};
