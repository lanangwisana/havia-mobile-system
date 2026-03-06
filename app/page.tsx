"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Fingerprint, Bell, QrCode, Briefcase, 
  MessageSquare, ClipboardList, Calendar, FileText, 
  Clock, DollarSign, Settings, ArrowLeft, Sparkles, 
  MapPin, ArrowRight, LogIn, LogOut, Activity, 
  ChevronRight, Plus, Home, User, Info, Users, Key
} from 'lucide-react';
import { loginWithToken } from './actions';

export default function HaviaMobileApp() {
   // State Management
  const [currentView, setCurrentView] = useState('login'); // login, dashboard, id, presensi, subpage
  const [activeNav, setActiveNav] = useState('home');
  const [subpageTitle, setSubpageTitle] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Real Data States
  const [apiToken, setApiToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Colors based on Logo
  const colors = {
    gold: '#D4AF37',
    darkGold: '#b59020',
    bg: '#0a0a0a',
    card: '#171717',
    border: '#262626',
    textMuted: '#a3a3a3'
  };

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation Handlers
  const handleNav = (view: string, nav?: string | null, title: string = '') => {
    setCurrentView(view);
    if (nav) setActiveNav(nav);
    if (title) setSubpageTitle(title);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- API Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiToken || !loginEmail) {
      showToast('Email dan API Token wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      // Panggil Server Action agar tidak terkena CORS block di browser
      const result = await loginWithToken(apiToken);

      if (!result.success) {
        throw new Error(result.error);
      }

      const users = result.data;
      console.log("Data from server action:", users);
      
      let matchedUser = null;

      if (Array.isArray(users)) {
        // Cari user yang emailnya cocok dengan yang diinputkan
        matchedUser = users.find((u: any) => u.email === loginEmail);
      } else if (users && typeof users === 'object') {
        if (users.email === loginEmail) {
           matchedUser = users;
        }
      }

      if (matchedUser) {
        setUserData(matchedUser);
        setCurrentView('dashboard');
        setActiveNav('home');
        showToast('Berhasil masuk aplikasi');
      } else {
        throw new Error('Data user tidak ditemukan untuk email tersebut.');
      }
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Subpage Content Components ---
  const ProyekContent = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-5 rounded-2xl border">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-white">RS Edelweiss</h4>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded font-bold">ON TRACK</span>
        </div>
        <p style={{ color: colors.textMuted }} className="text-xs mb-4 flex items-center gap-1"><MapPin className="w-3 h-3" /> Bandung, Jawa Barat</p>
        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
          <div style={{ backgroundColor: colors.gold }} className="h-full w-[85%]"></div>
        </div>
        <div style={{ color: colors.textMuted }} className="flex justify-between text-xs">
          <span>Struktur Lt. 4</span>
          <span style={{ color: colors.gold }} className="font-bold">85%</span>
        </div>
      </div>
      <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-5 rounded-2xl border">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-white">Kreativa School</h4>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-bold">DELAY</span>
        </div>
        <p style={{ color: colors.textMuted }} className="text-xs mb-4 flex items-center gap-1"><MapPin className="w-3 h-3" /> Kota Baru, Bandung</p>
        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
          <div className="bg-yellow-500 h-full w-[40%]"></div>
        </div>
        <div style={{ color: colors.textMuted }} className="flex justify-between text-xs">
          <span>Finishing Interior</span>
          <span className="text-yellow-400 font-bold">40%</span>
        </div>
      </div>
    </div>
  );

  const JadwalContent = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold text-white tracking-wide">Agenda Perusahaan</h3>
          <span style={{ color: colors.textMuted }} className="text-xs font-medium bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">Senin, 2 Maret</span>
      </div>
      <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border-l-4 border-l-[#D4AF37] flex gap-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-bl-full"></div>
          <div className="text-center min-w-[50px] flex flex-col justify-center border-r border-neutral-800 pr-4">
              <p className="text-sm font-bold text-white">09:00</p>
              <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest mt-1">10:30</p>
          </div>
          <div className="relative z-10">
              <h4 className="font-bold text-white text-sm mb-1.5">Site Visit RS Edelweiss</h4>
              <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed">Pengecekan Struktur Lt. 4 bersama tim Kontraktor GampaWorks.</p>
          </div>
      </div>
      <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border-l-4 border-l-blue-500 flex gap-5 shadow-lg relative overflow-hidden mt-3">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full"></div>
          <div className="text-center min-w-[50px] flex flex-col justify-center border-r border-neutral-800 pr-4">
              <p className="text-sm font-bold text-white">14:00</p>
              <p style={{ color: colors.textMuted }} className="text-[10px] uppercase tracking-widest mt-1">15:00</p>
          </div>
          <div className="relative z-10">
              <h4 className="font-bold text-white text-sm mb-1.5">Internal Meeting</h4>
              <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed">Koordinasi Desain Fasad Havia Studio (Online via Zoom).</p>
          </div>
      </div>
    </div>
  );

  const AkunContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 mb-4">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]"></div>
          <div className="absolute inset-[3px] rounded-full bg-[#111] z-10 flex items-center justify-center overflow-hidden">
            <img src={userData?.image || "https://4nesia.com/img/andiagus2.png"} className="w-full h-full object-cover" alt={userData?.first_name || "M. Rofii Sultan"} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wide">{userData?.first_name} {userData?.last_name}</h2>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{userData?.job_title || 'TEAM MEMBER'}</span>
        <div className="mt-4 px-4 py-1.5 bg-neutral-900 border border-[#D4AF37]/20 rounded-full flex items-center gap-2">
          <Mail className="w-3 h-3 text-neutral-400" />
          <span className="text-xs text-neutral-400">{userData?.email || 'email@haviastudio.com'}</span>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3 pl-1">Pengaturan Akun</p>
        
        {/* Edit Profile Button */}
        <button onClick={() => showToast('Edit Profile clicked')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border active:scale-[0.98] transition-all group hover:border-[#D4AF37]/50">
          <div className="flex items-center gap-4">
            <div className="bg-neutral-800/80 p-3 rounded-xl group-hover:bg-[#D4AF37]/10 transition-colors">
              <User className="w-5 h-5 text-neutral-400 group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Edit Profile</h4>
              <p className="text-[10px] text-neutral-500 tracking-wider">Perbarui informasi data diri</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-[#D4AF37] transition-colors" />
        </button>

        {/* Reset Password Button */}
        <button onClick={() => showToast('Reset Password clicked')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border active:scale-[0.98] transition-all group hover:border-[#D4AF37]/50 mt-3">
          <div className="flex items-center gap-4">
            <div className="bg-neutral-800/80 p-3 rounded-xl group-hover:bg-[#D4AF37]/10 transition-colors">
              <Lock className="w-5 h-5 text-neutral-400 group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Reset Password</h4>
              <p className="text-[10px] text-neutral-500 tracking-wider">Ganti kata sandi keamanan</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-[#D4AF37] transition-colors" />
        </button>
      </div>

      <div className="pt-6">
        {/* Logout Button */}
        <button onClick={() => { handleNav('login'); showToast('Berhasil Logout'); }} style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }} className="w-full text-left flex items-center justify-center gap-3 p-4 rounded-2xl border active:scale-[0.98] transition-all hover:bg-red-500/10 group">
          <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-red-500 text-sm tracking-wider uppercase">Keluar Aplikasi</h4>
        </button>
      </div>
    </div>
  );

  const renderSubpageContent = () => {
    switch(subpageTitle) {
      case 'Project': return ProyekContent();
      case 'Jadwal': return JadwalContent();
      case 'Akun': return AkunContent();
      default: return (
        <div className="flex flex-col items-center justify-center h-64 opacity-50 animate-in fade-in">
          <Info className="w-12 h-12 mb-4" style={{ color: colors.gold }} />
          <p className="text-center text-neutral-400 text-sm">Fitur <strong className="text-white">{subpageTitle}</strong> sedang dalam tahap pengembangan.</p>
        </div>
      );
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="text-white h-screen w-full overflow-hidden relative selection:bg-[#D4AF37] selection:text-black">

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-[#D4AF37]/30 text-white px-5 py-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)] z-50 flex items-center gap-3 transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}>
        <Sparkles style={{ color: colors.gold }} className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wide">{toastMsg}</span>
      </div>

      {/* ================= VIEW 1: LOGIN ================= */}
      {currentView === 'login' && (
        <section className="h-full w-full flex flex-col px-8 relative z-20 animate-in fade-in duration-500">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-neutral-800/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex-1 flex flex-col justify-center">
            {/* Elegant Typographic Logo */}
            <div className="flex flex-col items-center mb-16">
              <h1 className="text-4xl font-bold tracking-[0.2em] uppercase flex items-center">
                HA<span style={{ color: colors.gold }}>V</span>IA
              </h1>
              <span className="text-xs tracking-[0.4em] mt-2 font-medium">STUDIO</span>
              <div style={{ backgroundColor: colors.gold }} className="h-[1px] w-12 mt-4 mb-3"></div>
              <p className="text-[9px] text-neutral-500 tracking-[0.3em] uppercase">Enterprise App</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-neutral-500 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Masukkan Email..." 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                    className="w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] block pl-12 p-4 placeholder-neutral-600 transition-all border outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">API Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="text-neutral-500 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Masukkan API Token..." 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                    className="w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] block pl-12 p-4 placeholder-neutral-600 transition-all border outline-none" 
                  />
                </div>
              </div>

              <button disabled={isLoading} type="submit" className={`w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 mt-8 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                <Fingerprint className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                <span className="uppercase tracking-widest text-xs">{isLoading ? 'MENGHUBUNGKAN...' : 'Masuk Aplikasi'}</span>
              </button>
            </form>
          </div>
          <div className="py-8 text-center">
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Havia Studio & GampaWorks v3.5</p>
          </div>
        </section>
      )}

      {/* ================= VIEW 2: DASHBOARD ================= */}
      {currentView === 'dashboard' && (
        <section className="h-full w-full flex flex-col relative overflow-y-auto scrollbar-hide pb-28 animate-in fade-in duration-300">
          <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 pt-12 pb-6 flex justify-between items-center backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
            <div>
              <p style={{ color: colors.gold }} className="text-[10px] uppercase tracking-widest mb-1 font-bold">Selamat Pagi, {userData?.first_name || ''}</p>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Semangat Bekerja! 🚀</h2>
            </div>
            <button onClick={() => showToast('Tidak ada notifikasi baru')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center relative hover:bg-neutral-800 transition-colors">
              <Bell className="w-5 h-5 text-neutral-400" />
              <span style={{ backgroundColor: colors.gold }} className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
            </button>
          </div>

          <div className="px-6 space-y-6 pt-6 flex-1 flex flex-col">
            {/* ID Card Widget */}
            <div onClick={() => handleNav('id', null)} className="w-full black-card-gradient rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10 active:scale-[0.98] transition-transform cursor-pointer group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-[#D4AF37]/20 transition-colors"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-[#D4AF37]/50 p-1">
                    <img src={userData?.image || "https://4nesia.com/img/andiagus2.png"} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Profile" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-wide">{userData?.first_name} {userData?.last_name}</h3>
                    <p style={{ color: colors.gold }} className="text-xs font-bold uppercase tracking-widest mt-1">{userData?.job_title || 'TEAM MEMBER'}</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                  <QrCode className="w-5 h-5 text-neutral-300" />
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end relative z-10">
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Company</p>
                  <p className="text-xs font-semibold text-neutral-300 tracking-wider">HAVIA STUDIO & GAMPAWORKS</p>
                </div>
                <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-[9px] font-bold rounded-full border border-green-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ACTIVE
                </span>
              </div>
            </div>

            {/* Time Widget */}
            <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-3xl p-5 flex justify-between items-center border">
              <div>
                <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1">Waktu Sekarang</p>
                <h2 className="text-3xl font-light text-white font-mono tracking-tighter">{currentTime || '14:20:25'}</h2>
                <span className="text-[10px] text-neutral-500 font-medium">WIB / Western Indonesia</span>
              </div>
              <div className="text-right border-l border-white/5 pl-4">
                <div className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">On Time</div>
                <p className="text-[10px] text-neutral-500">Shift: 08:00 - 17:00</p>
              </div>
            </div>

            {/* Menu Grid (3D Icons & No Title - 2 Columns, Larger Buttons) */}
            <div className="flex-1 pt-2 pb-6">
              <div className="grid grid-cols-2 gap-y-8 gap-x-6 h-full content-center">
                {[
                  { id: 'Project', icon: Briefcase },
                  { id: 'Tim', icon: Users },
                  { id: 'Finance', icon: DollarSign },
                  { id: 'Jadwal', icon: Calendar }
                ].map((item) => (
                  <button key={item.id} onClick={() => handleNav('subpage', null, item.id)} className="flex flex-col items-center gap-4 group active:scale-95 transition-transform w-full">
                    <div className="w-full aspect-square max-w-[120px] btn-3d flex items-center justify-center group-hover:btn-3d-hover transition-all duration-300">
                      <item.icon className="w-12 h-12 text-neutral-400 group-hover:text-[#111] transition-colors drop-shadow-md" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-neutral-400 group-hover:text-white transition-colors uppercase">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= VIEW 3: DIGITAL ID ================= */}
      {currentView === 'id' && (
        <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300">
          <div className="px-6 py-6 flex items-center relative border-b border-white/5">
            <button onClick={() => handleNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors z-20">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div style={{ color: colors.gold }} className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase">Digital ID</span>
              </div>
              <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">Havia Enterprise</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-8 pb-20">
            <div className="w-full bg-[#111] rounded-[2.5rem] p-8 border border-[#D4AF37]/30 relative overflow-hidden shadow-2xl">
              {/* Background H Watermark */}
              <div className="absolute -right-8 -bottom-12 text-[180px] font-serif font-bold text-white/5 pointer-events-none select-none leading-none">H</div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-white tracking-[0.2em] uppercase flex items-center leading-none">
                    HA<span style={{ color: colors.gold }}>V</span>IA
                  </h3>
                  <span className="text-[8px] text-neutral-400 uppercase tracking-[0.3em] mt-1 font-medium">Studio</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              </div>

              <div className="flex flex-col items-center mb-10 relative z-10">
                <div className="relative w-36 h-36 mb-6">
                  <div className="absolute inset-0 rounded-full avatar-glow"></div>
                  <div className="absolute inset-[3px] rounded-full bg-[#111] z-10 flex items-center justify-center overflow-hidden">
                    <img src={userData?.image || "https://4nesia.com/img/andiagus2.png"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={userData?.first_name || "Andi Agus Salim"} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-wide text-center">{userData?.first_name} {userData?.last_name}</h2>
                <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-[0.3em]">{userData?.job_title || 'TEAM MEMBER'}</span>
              </div>

              <div className="flex justify-center mb-10 relative z-10">
                <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <QrCode className="w-20 h-20 text-black" strokeWidth={1.5} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 relative z-10">
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">ID Number</p>
                  <p className="text-sm font-mono text-white tracking-wider">HAV-882910</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Valid Until</p>
                  <p className="text-sm font-mono text-white tracking-wider">12/30</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= VIEW 4: PRESENSI ================= */}
      {currentView === 'presensi' && (
        <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-6 flex items-center justify-between z-20">
            <button onClick={() => handleNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="font-bold text-sm uppercase tracking-widest text-white">Presensi Pegawai</h2>
            <div className="w-10"></div>
          </div>

          {/* Map Simulation */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-neutral-900 overflow-hidden z-0 border-b border-[#D4AF37]/20">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
            
            {/* Radar */}
            <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-40 h-40 border border-[#D4AF37]/30 rounded-full absolute"></div>
              <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full animate-radar absolute"></div>
              <div style={{ backgroundColor: colors.gold }} className="w-4 h-4 rounded-full border-2 border-black shadow-[0_0_15px_rgba(212,175,55,0.8)] relative z-10"></div>
              <div className="absolute top-8 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl tracking-wider">
                Havia HQ
              </div>
            </div>
          </div>

          <div className="flex-1 z-10 flex flex-col justify-end">
            <div style={{ backgroundColor: colors.card }} className="rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#D4AF37]/20 relative">
              <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-8 absolute top-4 left-1/2 transform -translate-x-1/2"></div>
              
              <div className="text-center mb-10 mt-2">
                <h1 className="text-5xl font-light font-mono tracking-tighter text-white mb-2">{currentTime || '14:20:25'}</h1>
                <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold">Senin, 2 Maret 2026</p>
                
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold border border-green-500/20 tracking-wider">
                  <MapPin className="w-3 h-3" />
                  <span>Dalam Radius Kantor</span>
                </div>
              </div>

              <button onClick={() => showToast('Presensi Masuk Berhasil!')} className="w-full p-1 rounded-2xl shadow-glow group active:scale-[0.98] transition-all gold-gradient">
                <div style={{ backgroundColor: colors.bg }} className="rounded-xl h-16 flex items-center justify-between px-2 cursor-pointer m-[2px]">
                  <div style={{ backgroundColor: colors.gold }} className="h-12 w-12 rounded-lg flex items-center justify-center shadow-lg transform group-hover:translate-x-[calc(100vw-8rem)] transition-transform duration-700 ease-out">
                    <ArrowRight className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-white font-bold text-xs uppercase tracking-widest pr-14 opacity-70 group-hover:opacity-0 transition-opacity">Geser untuk Masuk</span>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div style={{ backgroundColor: colors.bg, borderColor: colors.border }} className="p-4 rounded-xl border">
                  <div className="flex items-center gap-2 mb-3 text-green-400">
                    <LogIn className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Masuk</span>
                  </div>
                  <p className="text-xl font-bold text-white">07:55</p>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Tepat Waktu</p>
                </div>
                <div style={{ backgroundColor: colors.bg, borderColor: colors.border }} className="p-4 rounded-xl border opacity-50">
                  <div className="flex items-center gap-2 mb-3 text-neutral-400">
                    <LogOut className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pulang</span>
                  </div>
                  <p className="text-xl font-bold text-neutral-500">--:--</p>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-widest mt-1">Belum Absen</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= VIEW 5: SUBPAGE ================= */}
      {currentView === 'subpage' && (
        <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300">
          <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0">
            <button onClick={() => handleNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 style={{ color: colors.gold }} className="font-bold text-sm uppercase tracking-widest">{subpageTitle}</h2>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 p-6 pb-40 overflow-y-auto">
            {renderSubpageContent()}
          </div>
        </section>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      {['dashboard', 'subpage', 'presensi'].includes(currentView) && (
        <div style={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', borderColor: colors.border }} className="fixed bottom-6 left-6 right-6 h-16 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between px-6 border animate-in slide-in-from-bottom-8">
          
          <button onClick={() => handleNav('dashboard', 'home')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'home' ? 'text-[#D4AF37]' : 'text-neutral-500 hover:text-white'}`}>
            <Home className="w-6 h-6" strokeWidth={activeNav === 'home' ? 2.5 : 1.5} />
          </button>
          
          <button onClick={() => handleNav('subpage', 'project', 'Project')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'project' ? 'text-[#D4AF37]' : 'text-neutral-500 hover:text-white'}`}>
            <Briefcase className="w-6 h-6" strokeWidth={activeNav === 'project' ? 2.5 : 1.5} />
          </button>
          
          {/* Main FAB - Presensi */}
          <div className="relative -top-6">
            <button onClick={() => handleNav('presensi', 'presensi')} className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] transform hover:scale-105 active:scale-95 transition-all rotate-45 group border-2 border-[#0a0a0a]">
              <div className="-rotate-45">
                <Fingerprint className="w-7 h-7 text-black" strokeWidth={2} />
              </div>
            </button>
          </div>
          
          <button onClick={() => handleNav('subpage', 'chat', 'Chat')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'chat' ? 'text-[#D4AF37]' : 'text-neutral-500 hover:text-white'}`}>
            <MessageSquare className="w-6 h-6" strokeWidth={activeNav === 'chat' ? 2.5 : 1.5} />
          </button>
          
          <button onClick={() => handleNav('subpage', 'akun', 'Akun')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'akun' ? 'text-[#D4AF37]' : 'text-neutral-500 hover:text-white'}`}>
            <User className="w-6 h-6" strokeWidth={activeNav === 'akun' ? 2.5 : 1.5} />
          </button>

        </div>
      )}

    </div>
  );
}
