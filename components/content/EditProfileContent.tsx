import React from 'react';
import { Sparkles, Camera, Image as ImageIcon, User, X } from 'lucide-react';
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
  onDeleteImage: () => void;
  isDeletingImage: boolean;
}

export const EditProfileContent: React.FC<EditProfileContentProps> = ({
  userData, editForm, setEditForm, handleSaveProfile, isSavingProfile, onCancel,
  onUploadImage, isUploadingImage, onDeleteImage, isDeletingImage
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const inputClass = "w-full text-neutral-900 text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-400 transition-all border outline-none";
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      setShowMenu(false);
    }
  };

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
       <div className="flex flex-col items-center mb-2 relative">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Profile Circle */}
        <div 
          onClick={() => !isUploadingImage && !isDeletingImage && setShowMenu(!showMenu)}
          className={`relative w-24 h-24 mb-3 cursor-pointer group transition-all ${isUploadingImage || isDeletingImage ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
        >
          <div className="absolute inset-0 rounded-full border border-[#C69C3D]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:border-[#C69C3D] transition-colors"></div>
          <div className="absolute inset-[3px] rounded-full bg-neutral-50 z-10 flex items-center justify-center overflow-hidden">
            {isUploadingImage || isDeletingImage ? (
               <div className="w-6 h-6 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <img src={getUserImage(userData)} className="w-full h-full object-cover" alt="Profile" />
            )}
          </div>
          {!isUploadingImage && !isDeletingImage && (
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#C69C3D] rounded-full border-2 border-white z-20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Bubble Menu / Context Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute top-20 z-[100] w-48 bg-white/95 backdrop-blur-xl border border-neutral-100 rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}
                className="flex items-center gap-3 w-full p-3 hover:bg-neutral-50 rounded-xl transition-colors text-left"
              >
                <ImageIcon className="w-4 h-4 text-[#C69C3D]" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">Upload Photo</span>
              </button>
              
              <button 
                onClick={() => { onDeleteImage(); setShowMenu(false); }}
                className="flex items-center gap-3 w-full p-3 hover:bg-neutral-50 rounded-xl transition-colors text-left text-rose-600"
              >
                <User className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Use Initials</span>
              </button>

              <div className="pt-1 border-t border-neutral-100">
                <button 
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 w-full p-2 hover:bg-neutral-50 rounded-xl transition-colors text-left opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Cancel</span>
                </button>
              </div>
            </div>
            
            {/* Arrow pointer for the bubble */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-neutral-100 rotate-45"></div>
          </div>
        )}

        <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">Click photo for options</p>
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
          className={`w-full gold-gradient text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSavingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <Sparkles className={`w-5 h-5 ${isSavingProfile ? 'animate-pulse' : ''}`} />
          <span className="uppercase tracking-widest text-xs">{isSavingProfile ? 'SAVING...' : 'Save Changes'}</span>
        </button>
        <button onClick={onCancel} className="w-full py-3 rounded-xl border border-neutral-100 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-200 transition-all active:scale-[0.98]">
          Cancel
        </button>
      </div>
    </div>
  );
};
