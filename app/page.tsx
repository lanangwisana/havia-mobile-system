"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Fingerprint, Bell, QrCode, Briefcase, 
  MessageSquare, ClipboardList, Calendar, FileText, 
  Clock, DollarSign, Settings, ArrowLeft, Sparkles, 
  MapPin, ArrowRight, LogIn, LogOut, Activity, 
  ChevronRight, Plus, Home, User, Info, Users, Key
} from 'lucide-react';
import { loginWithToken, fetchFromApi } from './actions';

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Helper to ensure we only show real images or generate initials
  const getUserImage = (user: any) => {
    if (!user) return "https://ui-avatars.com/api/?name=User&background=D4AF37&color=111";
    
    // Check if the image from API is valid and NOT the default RISE CRM avatar
    const imgUrl = user.image || user.avatar || "";
    
    // Check if the image string is actually a PHP serialized array from RISE (as seen in the console error)
    // Example: a:1:{i:0;a:2:{s:9:"file_name";s:29:"_file69aa5489918ac-avatar.png";...
    const serializedMatch = imgUrl.match(/"file_name";s:\d+:"([^"]+)"/);
    if (serializedMatch && serializedMatch[1]) {
      // It's a real uploaded file, construct the RISE CRM profile image path
      return `https://brain.havia.id/files/profile_images/${serializedMatch[1]}`;
    }

    if (imgUrl.trim() === "" || imgUrl.includes("avatar.jpg") || imgUrl.includes("default") || imgUrl === "null") {
      const init1 = user.first_name || "User";
      const init2 = user.last_name || "";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(init1)}+${encodeURIComponent(init2)}&background=D4AF37&color=111`;
    }
    
    // Optional fallback if it's already a clean URL
    return imgUrl;
  };

  // Colors based on Logo
  const colors = {
    gold: '#C69C3D',
    darkGold: '#b59020',
    bg: '#0a0a0a',
    card: '#171717',
    border: '#262626',
    textMuted: '#a3a3a3'
  };

  // Clock Effect
  // Helper for dynamic greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Helper for attendance status
  const getAttendanceStatus = () => {
    // In a real app, you compare the actual clock-in time with the shift start time.
    // For now, let's simulate it based on current time vs a hypothetical 08:00 shift.
    const now = new Date();
    const shiftStart = new Date();
    shiftStart.setHours(8, 0, 0, 0); // 08:00 AM shift start

    // If it's past 08:15 AM, consider it late for example purposes
    const lateThreshold = new Date(shiftStart.getTime() + 15 * 60000); 

    if (now > lateThreshold) {
      return { status: "LATE", color: "text-red-500" };
    }
    return { status: "ON TIME", color: "text-green-500" };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check Auth Status on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('havia_user');
        const savedToken = localStorage.getItem('havia_token');
        
        if (savedUserStr && savedToken) {
          // 1. Secara instan load data dari cache (Local Storage) supaya tampil cepat
          const savedUser = JSON.parse(savedUserStr);
          setUserData(savedUser);
          setApiToken(savedToken);
          setCurrentView('dashboard');
          setActiveNav('home');
          setIsCheckingAuth(false);

          // 2. Lakukan Background Fetch/Sinkronisasi ke server secara diam-diam
          try {
            const result = await loginWithToken(savedToken);
            if (result.success && result.data) {
              const users = result.data;
              let latestUser = null;
              
              if (Array.isArray(users)) {
                latestUser = users.find((u: any) => u.email === savedUser.email);
              } else if (users && typeof users === 'object') {
                if (users.email === savedUser.email) {
                   latestUser = users;
                }
              }

              if (latestUser) {
                // Update state & cache dengan data terbaru dari server
                setUserData(latestUser);
                localStorage.setItem('havia_user', JSON.stringify(latestUser));
              }
            }
          } catch (syncError) {
            // Abaikan error saat sinkronisasi diam-diam, biarkan user tetap pakai data cache
            console.warn("Background sync failed:", syncError);
          }
        } else {
           setIsCheckingAuth(false);
        }
      } catch (e) {
        console.error("Error reading auth from storage", e);
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleNav = (view: string, nav?: string | null, title: string = '') => {
    setCurrentView(view);
    if (nav) setActiveNav(nav);
    if (title) setSubpageTitle(title);
  };

  // Fetch Notifications when navigating to the Notifications page
  useEffect(() => {
    if (currentView === 'subpage' && apiToken) {
      if (subpageTitle === 'Notifikasi') {
        const loadNotif = async () => {
          setIsLoadingNotif(true);
          try {
            console.log("Mencoba tarik data dari /api/notifications...");
            const res = await fetchFromApi('notifications', apiToken);
            console.log("HASIL FETCH NOTIF:", res);
            
            if (res.success && Array.isArray(res.data)) {
              setNotifications(res.data);
            } else {
              console.warn("Could not load notifications array", res);
            }
          } catch (e) {
            console.error("Failed fetching notifications", e);
          } finally {
            setIsLoadingNotif(false);
          }
        };
        loadNotif();
      } else if (subpageTitle === 'Project') {
        const loadProjects = async () => {
          setIsLoadingProjects(true);
          try {
            console.log("Mencoba tarik data dari /api/projects...");
            const res = await fetchFromApi('projects', apiToken);
            console.log("HASIL FETCH PROJECTS:", res);
            if (res.success && Array.isArray(res.data)) {
              setProjects(res.data);
            } else {
              console.warn("Could not load projects array", res);
            }
          } catch (e) {
            console.error("Failed fetching projects", e);
          } finally {
             setIsLoadingProjects(false);
          }
        };
        loadProjects();
      } else if (subpageTitle === 'Semua Task') {
        const loadAllTasks = async () => {
          setIsLoadingTasks(true);
          try {
            console.log(`Mencoba tarik data dari /api/tasks...`);
            const res = await fetchFromApi(`tasks`, apiToken);
            console.log("HASIL FETCH SEMUA TASKS:", res);
            
            if (res.success && Array.isArray(res.data)) {
              setProjectTasks(res.data);
            } else {
              setProjectTasks([]);
              console.warn("Could not load all tasks array", res);
            }
          } catch (e) {
            console.error("Failed fetching all tasks", e);
            setProjectTasks([]);
          } finally {
             setIsLoadingTasks(false);
          }
        };
        loadAllTasks();
      } else if (subpageTitle === 'Project Tasks' && activeProjectId) {
        const loadTasks = async () => {
          setIsLoadingTasks(true);
          try {
            console.log(`Mencoba tarik data dari /api/tasks?project_id=${activeProjectId}...`);
            const res = await fetchFromApi(`tasks?project_id=${activeProjectId}`, apiToken);
            console.log("HASIL FETCH TASKS:", res);
            
            if (res.success && Array.isArray(res.data)) {
              setProjectTasks(res.data);
            } else {
              setProjectTasks([]);
              console.warn("Could not load tasks array", res);
            }
          } catch (e) {
            console.error("Failed fetching tasks", e);
            setProjectTasks([]);
          } finally {
             setIsLoadingTasks(false);
          }
        };
        loadTasks();
      }
    }
  }, [currentView, subpageTitle, apiToken]);

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
      // Validasi JWT Payload (Token wajib milik Email tersebut)
      try {
        const payloadBase64 = apiToken.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const tokenEmail = decodedPayload.user || decodedPayload.email;
          if (tokenEmail && tokenEmail !== loginEmail) {
            throw new Error(`Autentikasi Ditolak`);
          }
        }
      } catch (jwtError: any) {
        if (jwtError.message.includes('Autentikasi')) {
           throw jwtError;
        }
        // Jika token bukan JWT standar, biarkan berlanjut untuk diverifikasi server
      }

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
        
        // Simpan data login agar tidak perlu login lagi setelah refresh
        localStorage.setItem('havia_user', JSON.stringify(matchedUser));
        localStorage.setItem('havia_token', apiToken);

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      
      <div className="px-1 space-y-4">
      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800">
           <div className="w-16 h-16 rounded-full bg-[#C69C3D]/10 flex items-center justify-center mb-4">
               <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse" />
           </div>
           <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Sinkronisasi Project...</p>
        </div>
      ) : projects.length > 0 ? (
        projects.map((project: any, index: number) => {
           const totalPoints = parseFloat(project.total_points || "0");
           const completedPoints = parseFloat(project.completed_points || "0");
           const progress = project.progress ? parseInt(project.progress, 10) : (totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0);
           const isDone = progress === 100 || String(project.status).toLowerCase() === 'completed';
           let statusText = project.status_title || project.status || (isDone ? 'COMPLETED' : 'OPEN');
           statusText = String(statusText).toUpperCase();
           
           // Status Colors
           let statusColorClasses = 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20 shadow-[0_0_10px_rgba(198,156,61,0.1)]'; // Default OPEN
           if (statusText === 'COMPLETED' || statusText === 'DONE') {
              statusColorClasses = 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
           } else if (statusText === 'HOLD' || statusText === 'ON HOLD') {
              statusColorClasses = 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
           } else if (statusText === 'CANCELED' || statusText === 'CANCELLED') {
              statusColorClasses = 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
           }
           
           return (
            <div 
              key={project.id || index} 
              onClick={() => { 
                setActiveProjectId(project.id); 
                setActiveProjectName(project.title); 
                handleNav('subpage', null, 'Project Tasks'); 
              }}
              style={{ backgroundColor: colors.card, borderColor: colors.border }} 
              className="rounded-3xl border relative overflow-hidden group hover:border-[#C69C3D]/50 transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.98]"
            >
              
              <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500 ${isDone ? 'bg-green-500' : 'bg-[#C69C3D]'}`}></div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex gap-4 items-center flex-1 pr-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 transition-colors ${isDone ? 'bg-green-500/10 border-green-500/20' : 'bg-[#C69C3D]/10 border-[#C69C3D]/20 group-hover:bg-[#C69C3D]/20'}`}>
                      {isDone ? <Activity className="w-6 h-6 text-green-400" /> : <Briefcase className="w-6 h-6 text-[#C69C3D]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight group-hover:text-[#C69C3D] transition-colors">{project.title || `Project ${project.id}`}</h4>
                      {(() => {
                        const clientNameRes = project.client_name || project.company_name;
                        const isInternal = project.project_type === 'internal_project' || project.client_id === '0' || !clientNameRes;
                        if (!isInternal && clientNameRes) {
                          return (
                            <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3 text-neutral-500" /> {clientNameRes}
                            </p>
                          );
                        } else {
                          return (
                            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Internal Project</p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  
                  <span className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border shrink-0 ${statusColorClasses}`}>
                    {statusText}
                  </span>
                </div>
                
                <div className="flex gap-3 mb-5 relative z-10">
                  {project.start_date && (
                    <div className="bg-neutral-900/80 px-3 py-2 rounded-xl flex-1 border border-neutral-800/50 flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-0.5">Mulai</p>
                        <p className="text-[10px] text-white font-medium">{project.start_date}</p>
                      </div>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="bg-red-500/5 px-3 py-2 rounded-xl flex-1 border border-red-500/10 flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500/80" />
                      <div>
                        <p className="text-[8px] text-red-500/80 uppercase tracking-widest mb-0.5">Deadline</p>
                        <p className="text-[10px] text-red-100 font-medium">{project.deadline}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-neutral-800/50 mt-2 relative z-10">
                  <div className="flex justify-between items-end mb-2.5">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                       Status Progress
                    </span>
                    <span style={{ color: isDone ? '#22c55e' : colors.gold }} className="text-base leading-none font-bold font-mono">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden shadow-inner relative border border-black backdrop-blur-sm">
                    <div 
                       style={{ 
                         backgroundColor: isDone ? '#22c55e' : colors.gold, 
                         width: `${progress}%` 
                       }} 
                       className="absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-neutral-800">
             <Briefcase className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada project<br/>yang ditugaskan</p>
        </div>
      )}
      </div>
    </div>
  );

  const JadwalContent = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold text-white tracking-wide">Agenda Perusahaan</h3>
          <span style={{ color: colors.textMuted }} className="text-xs font-medium bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">Senin, 2 Maret</span>
      </div>
      <div style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border-l-4 border-l-[#C69C3D] flex gap-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#C69C3D]/5 rounded-bl-full"></div>
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
        <button onClick={() => showToast('Edit Profile clicked')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-full text-left flex items-center justify-between p-4 rounded-2xl border active:scale-[0.98] transition-all group hover:border-[#C69C3D]/50">
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

  const NotifikasiContent = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Pemberitahuan</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:opacity-80">Tandai Dibaca</span>
      </div>

      {isLoadingNotif ? (
        <div className="flex flex-col items-center justify-center py-10">
           <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
           <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Data...</p>
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((notif: any, index: number) => (
          <div key={notif.id || index} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="p-4 rounded-2xl border flex gap-4 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group">
            {/* Indikator Unread */}
            {notif.is_read === "0" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C69C3D]"></div>}
            
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 shrink-0">
              <Bell className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-bold text-sm ${notif.is_read === "0" ? 'text-white' : 'text-neutral-300'}`}>
                  {notif.event || notif.title || 'Pemberitahuan'}
                </h4>
                <span className="text-[9px] text-neutral-500 font-medium">
                  {notif.created_at ? new Date(notif.created_at).toLocaleDateString('id-ID') : ''}
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed mb-1">
                {/* Deskripsi pesan atau notif */}
                {notif.description || notif.message || 'Anda memiliki notifikasi baru.'}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 opacity-50">
          <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
          <p className="text-xs text-neutral-500 tracking-widest">TIDAK ADA NOTIFIKASI</p>
        </div>
      )}
    </div>
  );

  const SemuaTaskContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Semua Task Proyek</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{projectTasks.length} Tugas</span>
      </div>

      {isLoadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
           <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas...</p>
        </div>
      ) : projectTasks.length > 0 ? (
        <div className="space-y-4">
          {projectTasks.map((task: any, index: number) => {
            const isDone = String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed';
            const proj = projects.find(p => String(p.id) === String(task.project_id));
            const projName = proj ? proj.title : `Project ${task.project_id}`;
            
            return (
            <div key={task.id || index} style={{ backgroundColor: colors.card, borderColor: isDone ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.05)' }} className="p-5 rounded-[2rem] border relative overflow-hidden group shadow-xl">
              <div className="flex gap-4 items-start relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-inner ${isDone ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-base mb-2 truncate ${isDone ? 'text-green-400/90 line-through' : 'text-white'}`}>{task.title}</h4>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1818]/60 rounded-lg border border-white/5 text-[9px] font-bold uppercase tracking-widest text-[#C69C3D] mb-3">
                     <Briefcase className="w-3 h-3" /> {projName}
                  </span>
                    <p className="text-xs leading-relaxed text-neutral-400 line-clamp-2 mb-4">
                    {task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-y-4 pt-4 border-t border-white/5">
                    <div className="flex gap-6">
                      {task.start_date && (
                        <div>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-1 font-bold">Mulai</p>
                          <p className="text-[10px] text-neutral-300 font-medium font-mono">{task.start_date.split(' ')[0]}</p>
                        </div>
                      )}
                      {task.deadline && (
                        <div>
                          <p className="text-[8px] text-red-500/90 uppercase tracking-[0.2em] mb-1 font-bold">Deadline</p>
                          <p className="text-[10px] text-red-200 font-medium font-mono">{task.deadline.split(' ')[0]}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto">
                      {(() => {
                        const tStatus = String(task.status_title || task.status || 'OPEN').toUpperCase();
                        let badgeClass = 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/30'; // Default Open
                        if (tStatus === 'COMPLETED' || tStatus === 'DONE') {
                           badgeClass = 'bg-green-500/10 text-green-400 border-green-500/30';
                        } else if (tStatus === 'IN PROGRESS') {
                           badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                        } else if (tStatus === 'ON HOLD' || tStatus === 'HOLD') {
                           badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
                        } else if (tStatus === 'CANCELED' || tStatus === 'CANCELLED') {
                           badgeClass = 'bg-red-500/10 text-red-400 border-red-500/30';
                        }
                        return (
                          <span className={`text-[8px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-[0.15em] border whitespace-nowrap shadow-sm ${badgeClass}`}>
                            {tStatus}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <ClipboardList className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Tidak ada task<br/>untuk saat ini</p>
        </div>
      )}
    </div>
  );

  const ProjectTasksContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Tasks: <span className="text-[#C69C3D]">{activeProjectName || 'Project'}</span></h3>
        </div>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{projectTasks.length} Tugas</span>
      </div>

      {isLoadingTasks ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Activity className="w-8 h-8 text-[#C69C3D] animate-pulse mb-3" />
           <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Tugas Proyek...</p>
        </div>
      ) : projectTasks.length > 0 ? (
        <div className="space-y-4">
          {projectTasks.map((task: any, index: number) => {
            const isDone = String(task.status).toLowerCase() === 'done' || String(task.status).toLowerCase() === 'completed';
            
            return (
              <div key={task.id || index} style={{ backgroundColor: colors.card, borderColor: isDone ? 'rgba(34,197,94,0.2)' : colors.border }} className="p-4 rounded-3xl border relative overflow-hidden group shadow-lg">
                <div className="flex gap-4 items-start relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 mt-1 ${isDone ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-[#C69C3D]/10 border-[#C69C3D]/20 text-[#C69C3D]'}`}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-2 ${isDone ? 'text-green-400/90 line-through' : 'text-white'}`}>{task.title}</h4>
                    <p style={{ color: colors.textMuted }} className="text-xs leading-relaxed mb-4 line-clamp-2">
                      {task.description?.replace(/(<([^>]+)>)/gi, "") || 'Tidak ada deskripsi rinci untuk task ini.'}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50">
                      {task.deadline && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <p className="text-[10px] text-neutral-400 font-medium">{task.deadline}</p>
                        </div>
                      )}
                      <div className="ml-auto">
                        {(() => {
                          const pTaskStatus = String(task.status_title || task.status || 'OPEN').toUpperCase();
                          let taskBadgeClass = 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20';
                          if (pTaskStatus === 'COMPLETED' || pTaskStatus === 'DONE') {
                             taskBadgeClass = 'bg-green-500/10 text-green-400 border-green-500/20';
                          } else if (pTaskStatus === 'IN PROGRESS') {
                             taskBadgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                          } else if (pTaskStatus === 'ON HOLD' || pTaskStatus === 'HOLD') {
                             taskBadgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                          } else if (pTaskStatus === 'CANCELED' || pTaskStatus === 'CANCELLED') {
                             taskBadgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                          }
                          return (
                            <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider border ${taskBadgeClass}`}>
                              {pTaskStatus}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <Calendar className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada task<br/>di proyek ini</p>
        </div>
      )}
    </div>
  );

  const renderSubpageContent = () => {
    switch(subpageTitle) {
      case 'Project': return ProyekContent();
      case 'Semua Task': return SemuaTaskContent();
      case 'Project Tasks': return ProjectTasksContent();
      case 'Jadwal': return JadwalContent();
      case 'Akun': return AkunContent();
      case 'Notifikasi': return NotifikasiContent();
      default: return (
        <div className="flex flex-col items-center justify-center h-64 opacity-50 animate-in fade-in">
          <Info className="w-12 h-12 mb-4" style={{ color: colors.gold }} />
          <p className="text-center text-neutral-400 text-sm">Fitur <strong className="text-white">{subpageTitle}</strong> sedang dalam tahap pengembangan.</p>
        </div>
      );
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, fontFamily: '"Open Sans", sans-serif' }} className="text-white h-screen w-full overflow-hidden relative selection:bg-[#C69C3D] selection:text-black">

      {/* TOAST NOTIFICATION */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md border border-[#C69C3D]/30 text-white px-5 py-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)] z-50 flex items-center gap-3 transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}>
        <Sparkles style={{ color: colors.gold }} className="w-4 h-4" />
        <span className="text-xs font-bold tracking-wide">{toastMsg}</span>
      </div>

      {/* ================= VIEW 1: LOGIN ================= */}
      {currentView === 'login' && !isCheckingAuth && (
        <section className="h-full w-full flex flex-col px-8 relative z-20 animate-in fade-in duration-500">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-neutral-800/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#C69C3D]/5 rounded-full blur-[100px] pointer-events-none"></div>

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
                    <Mail className="text-neutral-500 w-5 h-5 group-focus-within:text-[#C69C3D] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Masukkan Email..." 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                    className="w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block pl-12 p-4 placeholder-neutral-600 transition-all border outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">API Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="text-neutral-500 w-5 h-5 group-focus-within:text-[#C69C3D] transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Masukkan API Token..." 
                    style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                    className="w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block pl-12 p-4 placeholder-neutral-600 transition-all border outline-none" 
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
              <p style={{ color: colors.gold }} className="text-[10px] uppercase tracking-widest mb-1 font-bold">{getGreeting()}, {userData?.first_name || ''}</p>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">Semangat Bekerja! 🚀</h2>
            </div>
            <button onClick={() => handleNav('subpage', null, 'Notifikasi')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center relative hover:bg-neutral-800 transition-colors">
              <Bell className="w-5 h-5 text-neutral-400" />
              <span style={{ backgroundColor: colors.gold }} className="absolute top-2 right-2 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
            </button>
          </div>

          <div className="px-6 space-y-6 pt-6 flex-1 flex flex-col">
            {/* ID Card Widget */}
            <div onClick={() => handleNav('id', null)} className="w-full black-card-gradient rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10 active:scale-[0.98] transition-transform cursor-pointer group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C69C3D]/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-[#C69C3D]/20 transition-colors"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-[#C69C3D]/50 p-1">
                    <img src={getUserImage(userData)} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Profile" />
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
                <span className={`px-3 py-1.5 bg-neutral-900 ${getAttendanceStatus().color} text-[9px] font-bold rounded-full border border-neutral-800 flex items-center gap-1.5`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${getAttendanceStatus().status === 'ON TIME' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                  {getAttendanceStatus().status}
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

            <div className="flex-1 pt-2 pb-6">
              <div className="grid grid-cols-2 gap-y-8 gap-x-6 h-full content-center">
                {[
                  { id: 'Semua Task', label: 'Task', icon: ClipboardList },
                  { id: 'Tim', label: 'Tim', icon: Users },
                  { id: 'Finance', label: 'Finance', icon: DollarSign },
                  { id: 'Jadwal', label: 'Jadwal', icon: Calendar }
                ].map((item) => (
                  <button key={item.id} onClick={() => handleNav('subpage', null, item.id)} className="flex flex-col items-center gap-4 group active:scale-95 transition-transform w-full">
                    <div className="w-full aspect-square max-w-[120px] btn-3d flex items-center justify-center group-hover:border-[#C69C3D] group-active:border-[#C69C3D] transition-all duration-300">
                      <item.icon className="w-12 h-12 text-neutral-400 group-hover:text-[#C69C3D] group-active:text-[#C69C3D] transition-colors drop-shadow-md" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-neutral-400 group-hover:text-white group-active:text-[#C69C3D] transition-colors uppercase">{item.label}</span>
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
            <div className="w-full bg-[#2C2A29] rounded-[2.5rem] p-8 border border-[#C69C3D]/30 relative overflow-hidden shadow-2xl">
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
                  <div className="absolute inset-[3px] rounded-full bg-[#2C2A29] z-10 flex items-center justify-center overflow-hidden">
                    <img src={getUserImage(userData)} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={userData?.first_name || "User"} />
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
          <div className="absolute top-0 left-0 w-full h-1/2 bg-neutral-900 overflow-hidden z-0 border-b border-[#C69C3D]/20">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #C69C3D 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
            
            {/* Radar */}
            <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-40 h-40 border border-[#C69C3D]/30 rounded-full absolute"></div>
              <div className="w-24 h-24 bg-[#C69C3D]/20 rounded-full animate-radar absolute"></div>
              <div style={{ backgroundColor: colors.gold }} className="w-4 h-4 rounded-full border-2 border-black shadow-[0_0_15px_rgba(212,175,55,0.8)] relative z-10"></div>
              <div className="absolute top-8 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl tracking-wider">
                Havia HQ
              </div>
            </div>
          </div>

          <div className="flex-1 z-10 flex flex-col justify-end">
            <div style={{ backgroundColor: colors.card }} className="rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-[#C69C3D]/20 relative">
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
        <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300 bg-[#0a0a0a] overflow-hidden">
          {/* Top Navigation Bar */}
          <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-[70]">
            <button onClick={() => {
               if (subpageTitle === 'Project Tasks') {
                 handleNav('subpage', 'project', 'Project');
               } else {
                 handleNav('dashboard', 'home');
               }
            }} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 style={{ color: colors.gold }} className="font-bold text-sm uppercase tracking-widest">{subpageTitle}</h2>
            <div className="w-10"></div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 px-6 pt-6 pb-40 overflow-y-auto scrollbar-hide relative z-10">
            {renderSubpageContent()}
          </div>
        </section>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      {['dashboard', 'subpage', 'presensi'].includes(currentView) && (
        <div style={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', borderColor: colors.border }} className="fixed bottom-6 left-6 right-6 h-16 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between px-6 border animate-in slide-in-from-bottom-8">
          
          <button onClick={() => handleNav('dashboard', 'home')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'home' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
            <Home className="w-6 h-6" strokeWidth={activeNav === 'home' ? 2.5 : 1.5} />
          </button>
          
          <button onClick={() => handleNav('subpage', 'project', 'Project')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'project' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
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
          
          <button onClick={() => handleNav('subpage', 'chat', 'Chat')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'chat' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
            <MessageSquare className="w-6 h-6" strokeWidth={activeNav === 'chat' ? 2.5 : 1.5} />
          </button>
          
          <button onClick={() => handleNav('subpage', 'akun', 'Akun')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'akun' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
            <User className="w-6 h-6" strokeWidth={activeNav === 'akun' ? 2.5 : 1.5} />
          </button>

        </div>
      )}

    </div>
  );
}
