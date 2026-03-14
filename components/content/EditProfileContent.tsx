import React from 'react';
import { Sparkles } from 'lucide-react';
import { colors, getUserImage } from '@/lib/utils';

interface EditProfileContentProps {
  userData: any;
  editForm: any;
  setEditForm: (v: any) => void;
  handleSaveProfile: () => void;
  isSavingProfile: boolean;
  onCancel: () => void;
}

export const EditProfileContent: React.FC<EditProfileContentProps> = ({
  userData, editForm, setEditForm, handleSaveProfile, isSavingProfile, onCancel
}) => {
  const inputClass = "w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-600 transition-all border outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-2">
        <div className="relative w-24 h-24 mb-3">
          <div className="absolute inset-0 rounded-full border border-[#C69C3D]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]"></div>
          <div className="absolute inset-[3px] rounded-full bg-[#2C2A29] z-10 flex items-center justify-center overflow-hidden">
            <img src={getUserImage(userData)} className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Edit Informasi Data Diri</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Nama Depan</label>
          <input type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} placeholder="Nama Depan" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Nama Belakang</label>
          <input type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} placeholder="Nama Belakang" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Jabatan</label>
        <input type="text" value={editForm.job_title || ''} onChange={(e) => setEditForm({...editForm, job_title: e.target.value})} placeholder="Jabatan / Job Title" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Nomor Telepon</label>
        <input type="tel" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} placeholder="08xxxxxxxxxx" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Alamat</label>
        <textarea value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} placeholder="Alamat lengkap..." rows={3} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={`${inputClass} resize-none`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Gender</label>
        <div className="flex gap-3">
          {['male', 'female'].map((g) => (
            <button key={g} type="button" onClick={() => setEditForm({...editForm, gender: g})}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all active:scale-[0.97] ${editForm.gender === g ? 'bg-[#C69C3D]/15 border-[#C69C3D]/50 text-[#C69C3D]' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
              {g === 'male' ? '👤 Laki-laki' : '👩 Perempuan'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <button onClick={handleSaveProfile} disabled={isSavingProfile}
          className={`w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSavingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <Sparkles className={`w-5 h-5 ${isSavingProfile ? 'animate-pulse' : ''}`} />
          <span className="uppercase tracking-widest text-xs">{isSavingProfile ? 'MENYIMPAN...' : 'Simpan Perubahan'}</span>
        </button>
        <button onClick={onCancel} className="w-full py-3 rounded-xl border border-neutral-800 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-700 transition-all active:scale-[0.98]">
          Batal
        </button>
      </div>
    </div>
  );
};
