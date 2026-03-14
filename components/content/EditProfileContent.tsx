import React from 'react';
import { Sparkles, Camera } from 'lucide-react';
import { colors, getUserImage } from '@/lib/utils';

interface EditProfileContentProps {
  userData: any;
  editForm: any;
  setEditForm: (v: any) => void;
  handleSaveProfile: () => void;
  isSavingProfile: boolean;
  onCancel: () => void;
  onUploadImage: (file: File) => void;
  isUploadingImage: boolean;
}

export const EditProfileContent: React.FC<EditProfileContentProps> = ({
  userData, editForm, setEditForm, handleSaveProfile, isSavingProfile, onCancel,
  onUploadImage, isUploadingImage
}) => {
  const inputClass = "w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-500 transition-all border outline-none";
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!isUploadingImage) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <div 
          onClick={handleImageClick}
          className={`relative w-24 h-24 mb-3 cursor-pointer group transition-all ${isUploadingImage ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
        >
          <div className="absolute inset-0 rounded-full border border-[#C69C3D]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:border-[#C69C3D] transition-colors"></div>
          <div className="absolute inset-[3px] rounded-full bg-[#2C2A29] z-10 flex items-center justify-center overflow-hidden">
            {isUploadingImage ? (
               <div className="w-6 h-6 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <img src={getUserImage(userData)} className="w-full h-full object-cover" alt="Profile" />
            )}
          </div>
          {!isUploadingImage && (
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#C69C3D] rounded-full border-2 border-[#121212] z-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-black" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Klik foto untuk unggah baru</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">First Name</label>
          <input type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} placeholder="First Name" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Last Name</label>
          <input type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} placeholder="Last Name" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Job Title</label>
        <input type="text" value={editForm.job_title || ''} onChange={(e) => setEditForm({...editForm, job_title: e.target.value})} placeholder="Job Title" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
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
