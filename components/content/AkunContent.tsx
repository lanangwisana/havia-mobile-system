import React from 'react';
import { Mail, User, ChevronRight, Lock, LogOut } from 'lucide-react';
import { colors, getUserImage } from '@/lib/utils';

interface AkunContentProps {
  userData: any;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  onEditProfile: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const AkunContent: React.FC<AkunContentProps> = ({
  userData, onNav, onEditProfile, onLogout, showToast
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-28 h-28 mb-4">
        <div className="absolute inset-0 rounded-full border border-[#C69C3D]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]"></div>
        <div className="absolute inset-[3px] rounded-full bg-white z-10 flex items-center justify-center overflow-hidden">
          <img src={getUserImage(userData)} className="w-full h-full object-cover" alt={userData?.first_name || "User"} />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 tracking-wide">{userData?.first_name} {userData?.last_name || ''}</h2>
      <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{userData?.job_title || 'USER'}</span>
      <div className="mt-4 px-4 py-1.5 bg-neutral-100 border border-neutral-300/50 rounded-full flex items-center gap-2">
        <Mail className="w-3 h-3 text-neutral-600" />
        <span className="text-xs text-neutral-600 font-medium">{userData?.email || 'email@haviastudio.com'}</span>
      </div>
    </div>

    {/* Informasi Personal Section? Removed to match Add User modal simplicity */}

    {/* Account Settings Section */}
    <div className="space-y-3 pt-6">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-3 pl-1">Account Settings</p>
      
      {/* Edit Profile Button */}
      <button onClick={onEditProfile} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border-2 active:scale-[0.98] transition-all group hover:border-[#C69C3D]">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-100 p-3 rounded-xl group-hover:bg-[#C69C3D]/10 transition-colors border border-neutral-200">
            <User className="w-5 h-5 text-neutral-500 group-hover:text-[#C69C3D] transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 text-sm">Edit Profile</h4>
            <p className="text-[10px] text-neutral-500 font-medium tracking-wider">Update your personal information</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#C69C3D] transition-colors" />
      </button>

      {/* Reset Password Button */}
      <button onClick={() => onNav('subpage', null, 'Reset Password')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border-2 active:scale-[0.98] transition-all group hover:border-[#C69C3D] mt-3">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-100 p-3 rounded-xl group-hover:bg-[#C69C3D]/10 transition-colors border border-neutral-200">
            <Lock className="w-5 h-5 text-neutral-500 group-hover:text-[#C69C3D] transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 text-sm">Reset Password</h4>
            <p className="text-[10px] text-neutral-500 font-medium tracking-wider">Change your security password</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#C69C3D] transition-colors" />
      </button>
    </div>

    <div className="pt-6">
      {/* Logout Button */}
      <button onClick={onLogout} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }} className="w-full text-left flex items-center justify-center gap-3 p-4 rounded-2xl border active:scale-[0.98] transition-all hover:bg-red-500/10 group">
        <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
        <h4 className="font-bold text-red-500 text-sm tracking-wider uppercase">Logout Application</h4>
      </button>
    </div>
  </div>
);
