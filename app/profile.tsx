"use client";

import React, { useState } from 'react';
import {
  Mail, Lock, User, ChevronRight, LogOut, Sparkles
} from 'lucide-react';
import { putToApi } from './actions';

// Props interfaces
interface ProfileColors {
  gold: string;
  darkGold: string;
  bg: string;
  card: string;
  border: string;
  textMuted: string;
}

interface AkunContentProps {
  userData: any;
  apiToken: string;
  colors: ProfileColors;
  getUserImage: (user: any) => string;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
  showToast: (msg: string) => void;
  setUserData: (data: any) => void;
  setApiToken: (token: string) => void;
  setEditForm: (form: any) => void;
}

interface EditProfileContentProps {
  userData: any;
  apiToken: string;
  editForm: any;
  setEditForm: (form: any) => void;
  colors: ProfileColors;
  getUserImage: (user: any) => string;
  handleNav: (view: string, nav?: string | null, title?: string) => void;
  showToast: (msg: string) => void;
  setUserData: (data: any) => void;
}

export function AkunContent({
  userData, colors, getUserImage, handleNav, showToast,
  setUserData, setApiToken, setEditForm
}: AkunContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 mb-4">
          <div className="absolute inset-0 rounded-full border border-[#C69C3D]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]"></div>
          <div className="absolute inset-[3px] rounded-full bg-[#2C2A29] z-10 flex items-center justify-center overflow-hidden">
            <img src={getUserImage(userData)} className="w-full h-full object-cover" alt={userData?.first_name || "User"} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wide">{userData?.first_name} {userData?.last_name}</h2>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{userData?.job_title || 'TEAM MEMBER'}</span>
        <div className="mt-4 px-4 py-1.5 bg-neutral-900 border border-[#C69C3D]/20 rounded-full flex items-center gap-2">
          <Mail className="w-3 h-3 text-neutral-400" />
          <span className="text-xs text-neutral-400">{userData?.email || 'email@haviastudio.com'}</span>
        </div>
      </div>

      {/* Informasi Personal Section */}
      <div className="space-y-3 pt-6 border-t border-neutral-800">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 pl-1">Informasi Personal</p>
        
        <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Nomor Telepon</span>
            <span className="text-sm text-white font-medium">{userData?.phone || 'Belum diatur'}</span>
          </div>
          
          <div className="flex flex-col gap-1 pt-3 border-t border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Alamat (Mailing)</span>
            <span className="text-sm text-white font-medium break-words leading-relaxed">{userData?.address || 'Belum diatur'}</span>
          </div>

          {(userData?.alternative_phone || userData?.alternative_address) && (
            <>
              {userData?.alternative_phone && (
                <div className="flex flex-col gap-1 pt-3 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Telepon Alternatif</span>
                  <span className="text-sm text-white font-medium">{userData?.alternative_phone}</span>
                </div>
              )}
              {userData?.alternative_address && (
                <div className="flex flex-col gap-1 pt-3 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Alamat Alternatif</span>
                  <span className="text-sm text-white font-medium break-words leading-relaxed">{userData?.alternative_address}</span>
                </div>
              )}
            </>
          )}
          
          {(userData?.gender || userData?.dob) && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-800">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Gender</span>
                <span className="text-sm text-white font-medium capitalize">{userData?.gender || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Tgl Lahir</span>
                <span className="text-sm text-white font-medium">{userData?.dob || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pengaturan Akun Section */}
      <div className="space-y-3 pt-6">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 pl-1">Pengaturan Akun</p>
        
        {/* Edit Profile Button */}
        <button onClick={() => {
          setEditForm({
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            phone: userData?.phone || '',
            job_title: userData?.job_title || '',
            address: userData?.address || '',
            alternative_phone: userData?.alternative_phone || '',
            alternative_address: userData?.alternative_address || '',
            gender: userData?.gender || '',
          });
          handleNav('subpage', null, 'Edit Profile');
        }} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border active:scale-[0.98] transition-all group hover:border-[#C69C3D]/50">
          <div className="flex items-center gap-4">
            <div className="bg-neutral-800/80 p-3 rounded-xl group-hover:bg-[#C69C3D]/10 transition-colors">
              <User className="w-5 h-5 text-neutral-400 group-hover:text-[#C69C3D] transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Edit Profile</h4>
              <p className="text-[10px] text-neutral-500 tracking-wider">Perbarui informasi data diri</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-[#C69C3D] transition-colors" />
        </button>

        {/* Reset Password Button */}
        <button onClick={() => showToast('Reset Password clicked')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border active:scale-[0.98] transition-all group hover:border-[#C69C3D]/50 mt-3">
          <div className="flex items-center gap-4">
            <div className="bg-neutral-800/80 p-3 rounded-xl group-hover:bg-[#C69C3D]/10 transition-colors">
              <Lock className="w-5 h-5 text-neutral-400 group-hover:text-[#C69C3D] transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Reset Password</h4>
              <p className="text-[10px] text-neutral-500 tracking-wider">Ganti kata sandi keamanan</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-[#C69C3D] transition-colors" />
        </button>
      </div>

      <div className="pt-6">
        {/* Logout Button */}
        <button onClick={() => { 
          localStorage.removeItem('havia_user');
          localStorage.removeItem('havia_token');
          setUserData(null);
          setApiToken('');
          handleNav('login'); 
          showToast('Berhasil Logout'); 
        }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }} className="w-full text-left flex items-center justify-center gap-3 p-4 rounded-2xl border active:scale-[0.98] transition-all hover:bg-red-500/10 group">
          <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-red-500 text-sm tracking-wider uppercase">Keluar Aplikasi</h4>
        </button>
      </div>
    </div>
  );
}

export function EditProfileContent({
  userData, apiToken, editForm, setEditForm, colors,
  getUserImage, handleNav, showToast, setUserData
}: EditProfileContentProps) {
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!userData?.id || userData.id === '0') {
      showToast('Tidak bisa update profil di Dev Mode');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await putToApi(`users/${userData.id}`, apiToken, {
        first_name: editForm.first_name || '',
        last_name: editForm.last_name || '',
        phone: editForm.phone || '',
        job_title: editForm.job_title || '',
        address: editForm.address || '',
        alternative_phone: editForm.alternative_phone || '',
        alternative_address: editForm.alternative_address || '',
        gender: editForm.gender || '',
      });

      if (res.success) {
        const updatedUser = { ...userData, ...editForm };
        setUserData(updatedUser);
        localStorage.setItem('havia_user', JSON.stringify(updatedUser));
        showToast('Profil berhasil diperbarui! ✅');
        handleNav('subpage', null, 'Akun');
      } else {
        showToast(res.error || 'Gagal memperbarui profil.');
      }
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan.');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Telepon Alternatif</label>
        <input type="tel" value={editForm.alternative_phone || ''} onChange={(e) => setEditForm({...editForm, alternative_phone: e.target.value})} placeholder="Opsional" style={{ backgroundColor: colors.card, borderColor: colors.border }} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Alamat</label>
        <textarea value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} placeholder="Alamat lengkap..." rows={3} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={`${inputClass} resize-none`} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Alamat Alternatif</label>
        <textarea value={editForm.alternative_address || ''} onChange={(e) => setEditForm({...editForm, alternative_address: e.target.value})} placeholder="Opsional" rows={2} style={{ backgroundColor: colors.card, borderColor: colors.border }} className={`${inputClass} resize-none`} />
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
        <button onClick={() => handleNav('subpage', null, 'Akun')} className="w-full py-3 rounded-xl border border-neutral-800 text-neutral-400 text-xs uppercase tracking-widest font-bold hover:border-neutral-700 transition-all active:scale-[0.98]">
          Batal
        </button>
      </div>
    </div>
  );
}
