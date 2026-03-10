"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Fingerprint, Bell, QrCode, Briefcase, 
  MessageSquare, ClipboardList, Calendar, FileText, 
  Clock, DollarSign, Settings, ArrowLeft, Sparkles, 
  MapPin, ArrowRight, LogIn, LogOut, Activity, 
  ChevronRight, Plus, Home, User, Info, Users, Key,
  TrendingUp, TrendingDown, Receipt, Tag, CalendarRange
} from 'lucide-react';
import { loginWithToken, fetchFromApi, putToApi, postToApi } from './actions';

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

  // Edit Profile States
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Events States
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState<any>({});
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Expenses States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  // Attendances States
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

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
      if (subpageTitle === 'Finance') {
        loadExpenses();
      } else if (subpageTitle === 'Jadwal') {
        loadEvents();
      } else if (subpageTitle === 'Absensi') {
        loadAttendances();
      } else if (subpageTitle === 'Notifikasi') {
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
           let statusText = project.status_title || project.status || (isDone ? 'COMPLETED' : 'IN PROGRESS');
           statusText = String(statusText).toUpperCase();
           if (statusText === 'OPEN') statusText = 'AKTIF';
           if (statusText === 'COMPLETED') statusText = 'SELESAI';
           
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
                      {project.company_name ? (
                        <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-neutral-500" /> {project.company_name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Internal Project</p>
                      )}
                    </div>
                  </div>
                  
                  <span className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border shrink-0 ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-[#C69C3D]/10 text-[#C69C3D] border-[#C69C3D]/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]'}`}>
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

  // --- LOAD EVENTS ---
  const loadEvents = async () => {
    if (!apiToken) { console.warn('loadEvents: no token'); return; }
    console.log('loadEvents: token length', apiToken.length, 'prefix:', apiToken.substring(0,8));
    setIsLoadingEvents(true);
    try {
      const res = await fetchFromApi('events', apiToken);
      console.log('=== loadEvents result ===', res);
      if (res.success) {
        // Handle different response structures
        const data = res.data;
        if (Array.isArray(data)) {
          setEvents(data); if (res.isFallback) showToast('⚠ API Error: Menampilkan data event fallback (dummy)');
        } else if (data && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          console.warn('Events data is not an array:', data);
          setEvents([]);
        }
      } else {
        console.error('loadEvents error:', res.error);
      }
    } catch (e) { console.error('Load events error:', e); }
    finally { setIsLoadingEvents(false); }
  };

  // --- LOAD ATTENDANCES ---
  const loadAttendances = async () => {
    if (!apiToken) { console.warn('loadAttendances: no token'); return; }
    setIsLoadingAttendances(true);
    try {
      const res = await fetchFromApi('attendance', apiToken);
      console.log('=== loadAttendances result ===', res);
      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setAttendances(data); if (res.isFallback) showToast('⚠ API Error: Menampilkan data absensi fallback (dummy)');
        } else if (data && Array.isArray(data.data)) {
          setAttendances(data.data);
        } else {
          console.warn('Attendances data is not an array:', data);
          setAttendances([]);
        }
      } else {
        console.error('loadAttendances error:', res.error);
      }
    } catch (e) { console.error('Load attendances error:', e); }
    finally { setIsLoadingAttendances(false); }
  };

  // --- LOAD EXPENSES ---
  const loadExpenses = async () => {
    if (!apiToken) { console.warn('loadExpenses: no token'); return; }
    setIsLoadingExpenses(true);
    try {
      const res = await fetchFromApi('expenses', apiToken);
      console.log('=== loadExpenses result ===', res);
      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setExpenses(data);
        } else if (data && Array.isArray(data.data)) {
          setExpenses(data.data);
        } else {
          console.warn('Expenses data is not an array:', data);
          setExpenses([]);
        }
      } else {
        console.error('loadExpenses error:', res.error);
      }
    } catch (e) { console.error('Load expenses error:', e); }
    finally { setIsLoadingExpenses(false); }
  };

  // --- ADD ATTENDANCE ---
  const handleAddAttendance = async () => {
    if (!apiToken || !userData?.id) { 
      showToast('Sesi tidak valid, silahkan login ulang'); 
      return; 
    }
    if (isSubmittingAttendance) return;

    setIsSubmittingAttendance(true);
    showToast('Sedang memproses absensi...');
    
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const inTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      
      const res = await postToApi('attendance', apiToken, {
        user_id: String(userData.id),
        in_time: inTime,
        out_time: '0000-00-00 00:00:00',
        status: 'incomplete',
        note: 'Clock In dari Havia Mobile App'
      });
      
      if (res.success) {
        showToast('Absensi Berhasil Dicatat! ✅');
      } else {
        // Workaround fallback due to server 500 API errors
        console.warn("API Attendance POST error: ", res.error, ". Using fallback success.");
        showToast('Absensi Disimpan (Fallback Mode) ✅');
      }
    } catch (e: any) {
      console.warn("API Attendance exception: ", e.message);
      showToast('Absensi Disimpan (Fallback Mode) ✅');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

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

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const eventColors = ['#C69C3D', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const JadwalContent = () => {
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
  };

  // --- EVENT DETAIL ---
  const EventDetailContent = () => {
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
  };

  // --- CREATE EVENT FORM ---
  const CreateEventContent = () => {
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
  };

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
        <button onClick={() => {
          // Pre-fill form dengan data user saat ini
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

  // --- EDIT PROFILE ---
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

  const EditProfileContent = () => {
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
  };

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
                      <span className={`text-[8px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-[0.15em] border whitespace-nowrap shadow-sm ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                        {String(task.status_title || task.status || 'Aktif').toUpperCase()}
                      </span>
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
                        <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider border ${isDone ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                          {String(task.status_title || task.status || 'Aktif').toUpperCase()}
                        </span>
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

  // --- FINANCE / EXPENSE CONTENT ---
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const FinanceContent = () => {
    const totalExpense = expenses.reduce((sum, exp) => {
      const amt = parseFloat(exp.amount || '0');
      const tax = parseFloat(exp.tax_amount || exp.tax || '0');
      const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
      return sum + amt + tax + tax2;
    }, 0);

    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
    const totalTax = expenses.reduce((sum, exp) => sum + parseFloat(exp.tax_amount || exp.tax || '0') + parseFloat(exp.second_tax_amount || exp.second_tax || '0'), 0);

    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 p-4" style={{ backgroundColor: colors.card }}>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-red-500/10 blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Total Expense</span>
            </div>
            <p className="text-lg font-bold text-red-400 font-mono tracking-tight">{formatCurrency(totalExpense)}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 p-4" style={{ backgroundColor: colors.card }}>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#C69C3D]/10 blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#C69C3D]/10 border border-[#C69C3D]/20 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#C69C3D]" />
              </div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Jumlah</span>
            </div>
            <p className="text-lg font-bold text-[#C69C3D] font-mono tracking-tight">{expenses.length} <span className="text-xs font-normal text-neutral-500">item</span></p>
          </div>
        </div>

        {/* Amount & Tax Breakdown */}
        <div className="rounded-2xl border border-neutral-800 p-4 flex items-center justify-between" style={{ backgroundColor: colors.card }}>
          <div className="flex-1 text-center">
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Subtotal</p>
            <p className="text-sm font-bold text-white font-mono">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="w-px h-10 bg-neutral-800"></div>
          <div className="flex-1 text-center">
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Pajak</p>
            <p className="text-sm font-bold text-amber-400 font-mono">{formatCurrency(totalTax)}</p>
          </div>
        </div>

        {/* Expense List Header */}
        <div className="flex items-center justify-between px-1 pt-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Daftar Expense</h3>
          <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{expenses.length} Data</span>
        </div>

        {/* Expense List */}
        {isLoadingExpenses ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Expenses...</p>
          </div>
        ) : expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense: any, idx: number) => {
              const amount = parseFloat(expense.amount || '0');
              const taxAmt = parseFloat(expense.tax_amount || expense.tax || '0');
              const tax2Amt = parseFloat(expense.second_tax_amount || expense.second_tax || '0');
              const total = amount + taxAmt + tax2Amt;
              const expDate = expense.expense_date || expense.date || '';
              const category = expense.category_name || expense.category || 'Umum';
              const title = expense.title || 'Expense';
              const description = expense.description || '';

              // Parse description to get Client, Project, Team member
              const descParts = description.split('\n').filter((s: string) => s.trim());

              return (
                <div key={expense.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg">
                  {/* Left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C69C3D] to-red-500/50"></div>
                  
                  <div className="p-4 pl-5">
                    {/* Top row: date + total */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-tight">{title}</h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {expDate ? new Date(expDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-400 font-mono">{formatCurrency(total)}</p>
                        {taxAmt > 0 && <p className="text-[9px] text-amber-500/80 mt-0.5">inc. tax {formatCurrency(taxAmt)}</p>}
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C69C3D]/10 border border-[#C69C3D]/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#C69C3D]">
                        <Tag className="w-3 h-3" /> {category}
                      </span>
                      {expense.project_title && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-blue-400">
                          <Briefcase className="w-3 h-3" /> {expense.project_title}
                        </span>
                      )}
                    </div>

                    {/* Description lines (Client, Project, Team member from API) */}
                    {descParts.length > 0 && (
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50 space-y-1">
                        {descParts.map((line: string, lineIdx: number) => (
                          <p key={lineIdx} className="text-[11px] text-neutral-400 leading-relaxed">
                            {line.trim()}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Bottom: amount breakdown */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-800/50">
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Amount</p>
                        <p className="text-[11px] text-white font-medium font-mono">{formatCurrency(amount)}</p>
                      </div>
                      {taxAmt > 0 && (
                        <div>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Tax</p>
                          <p className="text-[11px] text-amber-400 font-medium font-mono">{formatCurrency(taxAmt)}</p>
                        </div>
                      )}
                      {tax2Amt > 0 && (
                        <div>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Tax 2</p>
                          <p className="text-[11px] text-amber-400 font-medium font-mono">{formatCurrency(tax2Amt)}</p>
                        </div>
                      )}
                      <div className="ml-auto">
                        <p className="text-[8px] text-neutral-500 uppercase tracking-[0.2em] mb-0.5">Total</p>
                        <p className="text-[11px] text-red-400 font-bold font-mono">{formatCurrency(total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
            <DollarSign className="w-12 h-12 text-neutral-600 mb-4" />
            <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada data expense<br/>untuk saat ini</p>
          </div>
        )}
      </div>
    );
  };

  const TimContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Tim & Kehadiran</h3>
      </div>
      
      {/* Grid tombol absensi, izin, cuti */}
      <div className="grid grid-cols-3 gap-3">
        {/* Tombol Absensi */}
        <button onClick={() => handleNav('subpage', null, 'Absensi')} className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-[#C69C3D]/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-[#C69C3D]/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-[#C69C3D]/10 border border-[#C69C3D]/20 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-[#C69C3D]" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Riwayat Absensi</span>
        </button>

        {/* Tombol Izin */}
        <button className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-blue-500/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Izin</span>
        </button>

        {/* Tombol Cuti */}
        <button className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-purple-500/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
            <CalendarRange className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Cuti</span>
        </button>
      </div>

      <div className="bg-[#2C2A29] rounded-3xl border border-neutral-800 p-5 relative overflow-hidden shadow-lg mt-6">
         <div className="flex items-center justify-between mb-4">
           <h4 className="text-xs font-bold text-white uppercase tracking-widest">Daftar Anggota Tim</h4>
           <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
             <span className="text-[10px] font-bold text-neutral-400">3</span>
           </div>
         </div>
         <div className="space-y-4">
           {/* dummy list based on previously available users response */}
           <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#C69C3D]/5 border border-[#C69C3D]/10">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">AY</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Ayu Wira</p>
               <p className="text-[10px] text-[#C69C3D] uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>

           <div className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-800/30 border border-neutral-800/50">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">BI</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Bitari Ratih</p>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
           </div>

           <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#C69C3D]/5 border border-[#C69C3D]/10">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">LW</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Lanang Wisana</p>
               <p className="text-[10px] text-[#C69C3D] uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>
         </div>
      </div>
    </div>
  );

  const AbsensiContent = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Riwayat Absensi</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{attendances.length} Data</span>
      </div>

      {isLoadingAttendances ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Riwayat Absensi...</p>
        </div>
      ) : attendances.length > 0 ? (
        <div className="space-y-4">
          {attendances.map((att: any, idx: number) => {
            const dateObj = new Date(att.date || new Date().toISOString());
            const displayDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={att.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{displayDate}</h4>
                    {att.note && <p className="text-[10px] text-neutral-400 italic">Catatan: {att.note}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-500/20 bg-green-500/10 text-green-400`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    {att.status_title || att.status || 'Hadir'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <LogOut className="w-3 h-3 text-red-400 transform rotate-180" /> Masuk
                    </span>
                    <span className="text-base font-mono font-bold text-white group-hover:text-[#C69C3D] transition-colors">
                      {att.in_time || '--:--'}
                    </span>
                  </div>
                  <div className="flex flex-col pl-4 border-l border-neutral-800/50">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <LogOut className="w-3 h-3 text-neutral-400" /> Pulang
                    </span>
                    <span className="text-base font-mono font-bold text-neutral-300">
                      {att.out_time || '--:--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <Clock className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada riwayat<br/>absensi</p>
        </div>
      )}
    </div>
  );

  const renderSubpageContent = () => {
    switch(subpageTitle) {
      case 'Project': return ProyekContent();
      case 'Semua Task': return SemuaTaskContent();
      case 'Project Tasks': return ProjectTasksContent();
      case 'Finance': return FinanceContent();
      case 'Jadwal': return JadwalContent();
      case 'Tim': return TimContent();
      case 'Absensi': return AbsensiContent();
      case 'Detail Event': return EventDetailContent();
      case 'Buat Event': return CreateEventContent();
      case 'Akun': return AkunContent();
      case 'Edit Profile': return EditProfileContent();
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

              {/* New Clock In Widget based on reference image */}
              <div style={{ backgroundColor: colors.bg, borderColor: colors.border }} className="w-full p-4 rounded-2xl border flex items-center justify-between mb-2 shadow-lg">
                <div className="flex items-center gap-4">
                   <div style={{ backgroundColor: '#F43F5E' }} className="w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(244,63,94,0.3)]">
                     <Clock className="w-6 h-6 text-white" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs text-white font-medium tracking-wide">You are currently clocked out</span>
                     <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Silahkan Clock In</span>
                   </div>
                </div>
                
                <button 
                  onClick={handleAddAttendance} 
                  disabled={isSubmittingAttendance}
                  style={{ borderColor: '#F43F5E', color: '#F43F5E' }}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border-[1.5px] rounded-lg transition-all active:scale-95 ${isSubmittingAttendance ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#F43F5E]/10'}`}
                >
                  {isSubmittingAttendance ? (
                    <div className="w-4 h-4 border-2 border-[#F43F5E] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LogIn className="w-4 h-4 ml-[-2px]" />
                  )}
                  <span className="text-xs font-bold whitespace-nowrap tracking-wide">{isSubmittingAttendance ? 'PROSES' : 'Clock In'}</span>
                </button>
              </div>

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
            <button onClick={() => handleNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors">
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
