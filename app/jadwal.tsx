"use client";

import React, { useState } from 'react';
import { Plus, Clock, MapPin, ChevronRight, Calendar, User, Sparkles } from 'lucide-react';
import { postToApi } from './actions';

interface JadwalColors {
  gold: string;
  darkGold: string;
  bg: string;
  card: string;
  border: string;
  textMuted: string;
}

export const eventColors = ['#C69C3D', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export const formatEventDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

interface JadwalContentProps {
  events: any[];
  isLoadingEvents: boolean;
  colors: JadwalColors;
  setEventForm: (form: any) => void;
  setSelectedEvent: (event: any) => void;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
}

export function JadwalContent({
  events, isLoadingEvents, colors, setEventForm, setSelectedEvent, handleNav
}: JadwalContentProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Agenda & Event</h3>
        <button onClick={() => {
          setEventForm({ color: '#C69C3D' });
          handleNav('subpage', null, 'Buat Event');
        }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C69C3D]/10 border border-[#C69C3D]/30 text-[#C69C3D] text-[10px] font-bold uppercase tracking-widest hover:bg-[#C69C3D]/20 transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      {isLoadingEvents ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event: any, idx: number) => {
            const color = event.color || eventColors[idx % eventColors.length];
            const startDate = formatEventDate(event.start_date);
            return (
              <button key={event.id || idx} onClick={() => {
                setSelectedEvent(event);
                handleNav('subpage', null, 'Detail Event');
              }} className="w-full text-left" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="p-4 rounded-2xl border-l-4 flex gap-4 shadow-lg relative overflow-hidden border border-neutral-800/50 hover:border-neutral-700 transition-all active:scale-[0.98]" style={{ borderLeftColor: color }}>
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: color }}></div>
                  <div className="text-center min-w-[55px] flex flex-col justify-center border-r border-neutral-800 pr-3">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{startDate.split(', ')[0] || ''}</p>
                    <p className="text-lg font-bold text-white">{event.start_date ? new Date(event.start_date).getDate() : '-'}</p>
                    <p className="text-[9px] uppercase tracking-widest" style={{ color }}>{event.start_date ? new Date(event.start_date).toLocaleDateString('id-ID', { month: 'short' }) : ''}</p>
                  </div>
                  <div className="flex-1 relative z-10 min-w-0">
                    <h4 className="font-bold text-white text-sm mb-1 truncate">{event.title || 'Untitled Event'}</h4>
                    {event.description && <p className="text-xs text-neutral-400 line-clamp-2 mb-2">{event.description}</p>}
                    <div className="flex items-center gap-3 flex-wrap">
                      {event.start_time && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-500"><Clock className="w-3 h-3" />{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1 text-[10px] text-neutral-500"><MapPin className="w-3 h-3" />{event.location}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-600 self-center shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <Calendar className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada event<br/>Klik tombol Tambah untuk membuat</p>
        </div>
      )}
    </div>
  );
}

interface EventDetailContentProps {
  selectedEvent: any;
  colors: JadwalColors;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
}

export function EventDetailContent({ selectedEvent, colors, handleNav }: EventDetailContentProps) {
  if (!selectedEvent) return <div className="text-center text-neutral-500 py-20">Event tidak ditemukan</div>;
  const ev = selectedEvent;
  const color = ev.color || '#C69C3D';
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }}></div>
        <div className="p-6 pt-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-lg" style={{ backgroundColor: color }}></div>
            <h2 className="text-xl font-bold text-white leading-tight">{ev.title || 'Untitled'}</h2>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-0.5">Tanggal</p>
                <p className="text-sm text-white font-medium">{formatEventDate(ev.start_date)}{ev.end_date && ev.end_date !== ev.start_date ? ` — ${formatEventDate(ev.end_date)}` : ''}</p>
              </div>
            </div>

            {(ev.start_time || ev.end_time) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-0.5">Waktu</p>
                  <p className="text-sm text-white font-medium">{ev.start_time || '-'}{ev.end_time ? ` — ${ev.end_time}` : ''}</p>
                </div>
              </div>
            )}

            {ev.location && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-0.5">Lokasi</p>
                  <p className="text-sm text-white font-medium">{ev.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {ev.description && (
        <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-5 rounded-2xl border">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-3">Deskripsi</p>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{ev.description}</p>
        </div>
      )}

      {ev.created_by_user && (
        <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Dibuat oleh</p>
            <p className="text-sm text-white font-medium">{ev.created_by_user}</p>
          </div>
        </div>
      )}

      <button onClick={() => handleNav('subpage', null, 'Jadwal')} className="w-full py-3 rounded-xl border border-neutral-800 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-700 transition-all active:scale-[0.98]">
        ← Kembali ke Jadwal
      </button>
    </div>
  );
}

interface CreateEventContentProps {
  eventForm: any;
  setEventForm: (form: any) => void;
  apiToken: string;
  colors: JadwalColors;
  showToast: (msg: string) => void;
  loadEvents: () => Promise<void>;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
}

export function CreateEventContent({
  eventForm, setEventForm, apiToken, colors, showToast, loadEvents, handleNav
}: CreateEventContentProps) {
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.start_date) {
      showToast('Judul dan Tanggal Mulai wajib diisi');
      return;
    }
    if (!apiToken) {
      showToast('Silahkan login terlebih dahulu');
      return;
    }
    setIsSavingEvent(true);
    try {
      const res = await postToApi('events', apiToken, {
        title: eventForm.title,
        description: eventForm.description || '',
        start_date: eventForm.start_date,
        end_date: eventForm.end_date || eventForm.start_date,
        start_time: eventForm.start_time || '',
        end_time: eventForm.end_time || '',
        location: eventForm.location || '',
        color: eventForm.color || '#C69C3D',
      });
      if (res.success) {
        showToast('Event berhasil dibuat! ✅');
        setEventForm({});
        await loadEvents();
        handleNav('subpage', null, 'Jadwal');
      } else {
        showToast(res.error || 'Gagal membuat event.');
      }
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan.');
    } finally { setIsSavingEvent(false); }
  };

  const inputClass = "w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-600 transition-all border outline-none";
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-[#C69C3D]/10 border border-[#C69C3D]/30 flex items-center justify-center mb-3">
          <Calendar className="w-7 h-7 text-[#C69C3D]" />
        </div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Buat Event Baru</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Judul Event *</label>
        <input type="text" value={eventForm.title || ''} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} placeholder="Nama event..." style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Deskripsi</label>
        <textarea value={eventForm.description || ''} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} placeholder="Deskripsi event..." rows={3} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={`${inputClass} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Tanggal Mulai *</label>
          <input type="date" value={eventForm.start_date || ''} onChange={(e) => setEventForm({...eventForm, start_date: e.target.value})} style={{ backgroundColor: colors.card, borderColor: colors.border, colorScheme: 'dark' }} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Jam Mulai</label>
          <input type="time" value={eventForm.start_time || ''} onChange={(e) => setEventForm({...eventForm, start_time: e.target.value})} style={{ backgroundColor: colors.card, borderColor: colors.border, colorScheme: 'dark' }} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Tanggal Selesai</label>
          <input type="date" value={eventForm.end_date || ''} onChange={(e) => setEventForm({...eventForm, end_date: e.target.value})} style={{ backgroundColor: colors.card, borderColor: colors.border, colorScheme: 'dark' }} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Jam Selesai</label>
          <input type="time" value={eventForm.end_time || ''} onChange={(e) => setEventForm({...eventForm, end_time: e.target.value})} style={{ backgroundColor: colors.card, borderColor: colors.border, colorScheme: 'dark' }} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Lokasi</label>
        <input type="text" value={eventForm.location || ''} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} placeholder="Lokasi event..." style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Warna</label>
        <div className="flex gap-2 flex-wrap">
          {eventColors.map((c) => (
            <button key={c} type="button" onClick={() => setEventForm({...eventForm, color: c})}
              className={`w-9 h-9 rounded-xl border-2 transition-all active:scale-90 ${eventForm.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <button onClick={handleCreateEvent} disabled={isSavingEvent}
          className={`w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSavingEvent ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <Sparkles className={`w-5 h-5 ${isSavingEvent ? 'animate-pulse' : ''}`} />
          <span className="uppercase tracking-widest text-xs">{isSavingEvent ? 'MENYIMPAN...' : 'Buat Event'}</span>
        </button>
        <button onClick={() => handleNav('subpage', null, 'Jadwal')} className="w-full py-3 rounded-xl border border-neutral-800 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-700 transition-all active:scale-[0.98]">
          Batal
        </button>
      </div>
    </div>
  );
}
