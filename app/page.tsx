"use client";

import React, { useState, useEffect } from 'react';
import { 
  loginWithToken, 
  loginWithEmailPassword, 
  fetchFromApi, 
  putToApi, 
  postToApi,
  deleteFromApi
} from './actions';

// Import Lib & Utils
import { colors } from '@/lib/utils';

// Import UI Components
import { Toast } from '@/components/ui/Toast';
import { BottomNav } from '@/components/ui/BottomNav';

// Import View Components
import { LoginView } from '@/components/views/LoginView';
import { DashboardView } from '@/components/views/DashboardView';
import { IDView } from '@/components/views/IDView';
import { PresensiView } from '@/components/views/PresensiView';
import { SubpageView } from '@/components/views/SubpageView';

export default function HaviaMobileApp() {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState('login'); // login, dashboard, id, presensi, subpage
  const [activeNav, setActiveNav] = useState('home');
  const [subpageTitle, setSubpageTitle] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Real Data States
  const [apiToken, setApiToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Events States
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    location: '',
    color: '#C69C3D'
  });
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Expenses States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  // Attendances States
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any | null>(null);
  const [lastFinishedAttendance, setLastFinishedAttendance] = useState<any | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // --- EFFECTS & HELPERS ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleNav = (view: string, nav?: string | null, title: string = '') => {
    setCurrentView(view);
    if (nav) setActiveNav(nav);
    if (title) setSubpageTitle(title);
  };

  // --- AUTH LOGIC ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('havia_user');
        const savedToken = localStorage.getItem('havia_token');
        
        if (savedUserStr && savedToken && savedUserStr !== 'null' && savedToken !== 'null') {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUserData(savedUser);
            setApiToken(savedToken);
            setCurrentView('dashboard');
            setActiveNav('home');
            
            // Sync with server in background
            fetchFromApi(`users/${savedUser.id}`, savedToken).then(result => {
              if (result.success && result.data) {
                setUserData(result.data);
                localStorage.setItem('havia_user', JSON.stringify(result.data));
              }
            }).catch(e => console.warn("Sync error", e));

          } catch (parseError) {
            console.error("Failed to parse user data", parseError);
            localStorage.removeItem('havia_user');
            localStorage.removeItem('havia_token');
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Email dan Password wajib diisi.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loginWithEmailPassword(loginEmail, loginPassword);
      if (res.success && res.data) {
        setApiToken(res.token || '');
        localStorage.setItem('havia_token', res.token || '');
        
        // AMBIL DATA PROFIL LENGKAP SETELAH LOGIN SUKSES
        // Karena API /login biasanya hanya mengembalikan data dasar (id, email)
        const fullProfileRes = await fetchFromApi(`users/${res.data.id}`, res.token || '');
        
        if (fullProfileRes.success && fullProfileRes.data) {
          const fullUser = fullProfileRes.data;
          setUserData(fullUser);
          localStorage.setItem('havia_user', JSON.stringify(fullUser));
        } else {
          // Fallback jika fetch profil gagal
          setUserData(res.data);
          localStorage.setItem('havia_user', JSON.stringify(res.data));
        }

        setCurrentView('dashboard');
        setActiveNav('home');
        showToast('Selamat Datang!');
      } else {
        showToast(res.error || 'Login Gagal. Cek kembali akun Anda.');
      }
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('havia_user');
    localStorage.removeItem('havia_token');
    setUserData(null);
    setApiToken('');
    handleNav('login');
    showToast('Berhasil Logout');
  };

  // --- DATA FETCHING ---
  const loadProjects = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingProjects(true);
    
    // Fetch all projects and all my tasks (including collaborators)
    const [pRes, tRes] = await Promise.all([
      fetchFromApi('projects', apiToken),
      fetchFromApi('tasks', apiToken)
    ]);

    if (pRes.success && tRes.success) {
      const allProjects = Array.isArray(pRes.data) ? pRes.data : [];
      const allTasks = Array.isArray(tRes.data) ? tRes.data : [];
      const myId = String(userData.id);

      // Map roles to projects
      const enrichedProjects = allProjects.filter((p: any) => {
        // Cek apakah user terlibat di project ini via task
        const projectTasks = allTasks.filter(t => String(t.project_id) === String(p.id));
        const isAssigned = projectTasks.some(t => String(t.assigned_to) === myId);
        const isCollab = projectTasks.some(t => t.collaborators && String(t.collaborators).split(',').includes(myId));
        
        if (isAssigned) p.userRole = 'PIC';
        else if (isCollab) p.userRole = 'KOLABORATOR';
        
        return isAssigned || isCollab;
      });

      setProjects(enrichedProjects);
    } else if (pRes.success) {
      setProjects([]);
    }
    
    setIsLoadingProjects(false);
  };

  const loadTasks = async (projectId: string | null = null) => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingTasks(true);
    
    const res = await fetchFromApi('tasks', apiToken);
    if (res.success) {
      const allTasks = Array.isArray(res.data) ? res.data : [];
      const myId = String(userData.id);

      let myTasks = allTasks.filter((t: any) => 
        String(t.assigned_to) === myId || 
        (t.collaborators && String(t.collaborators).split(',').includes(myId))
      ).map((t: any) => {
        // Attach role to task
        t.userRole = String(t.assigned_to) === myId ? 'PIC' : 'KOLABORATOR';
        return t;
      });

      if (projectId) {
        myTasks = myTasks.filter((t: any) => String(t.project_id) === String(projectId));
      }

      setProjectTasks(myTasks);
    }
    setIsLoadingTasks(false);
  };

  const loadExpenses = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingExpenses(true);
    // Filter by staff user_id
    const res = await fetchFromApi(`expenses?user_id=${userData.id}`, apiToken);
    if (res.success) setExpenses(Array.isArray(res.data) ? res.data : []);
    setIsLoadingExpenses(false);
  };

  const loadEvents = async () => {
    if (!apiToken || !userData?.id) return;
    setIsLoadingEvents(true);
    
    // Kita panggil API events melalui HaviaCMS bridge. 
    // Ini lebih stabil karena memuat helper yang diperlukan server core.
    const res = await fetchFromApi('haviacms/events', apiToken);
    
    if (res.success) {
      let eventsData = Array.isArray(res.data) ? res.data : [];
      
      // Jika data berasal dari fallback (karena server error 500), 
      // kita beri tanda agar user tidak bingung.
      if ((res as any).isFallback) {
        eventsData = eventsData.map((ev: any) => ({
          ...ev,
          title: `[FB] ${ev.title}`,
          isFallback: true
        }));
        const serverError = (res as any).serverErrorMessage;
        showToast(serverError ? `Server Error: ${serverError}` : 'Info: Menampilkan data simulasi karena server sedang kendala.');
      }

      setEvents(eventsData);
    } else {
      setEvents([]);
      if (res.error) showToast(`Gagal sinkron jadwal: ${res.error}`);
    }
    setIsLoadingEvents(false);
  };

  const loadLeaves = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingLeaves(true);
    const res = await fetchFromApi(`leave-applications?applicant_id=${userData.id}`, apiToken);
    if (res.success) setLeaves(Array.isArray(res.data) ? res.data : []);
    setIsLoadingLeaves(false);
  };

  const loadAttendances = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingAttendances(true);
    // Pakai API haviacms yang baru agar lebih akurat
    const res = await fetchFromApi(`haviacms/attendance`, apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      // Pastikan urutan terbaru di atas
      data.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
      setAttendances(data);
      
      // Cari yang statusnya masih aktif (belum ada jam keluar valid)
      const active = data.find(att => {
        const isStatusActive = att.status === 'incomplete';
        const isOutTimeEmpty = !att.out_time || 
                               att.out_time.startsWith('0000') || 
                               att.out_time.startsWith('-0001');
        return isStatusActive || (att.status === 'pending' && isOutTimeEmpty);
      });
      setActiveAttendance(active || null);
      
      // AUTO-HEAL: Jika record aktif memiliki junk data (0000-00-00), langsung HAPUS dari server
      if (active && (active.out_time?.startsWith('0000') || active.out_time?.startsWith('-0001'))) {
        console.log("Rogue record detected! Auto-healing by deletion...");
        (async () => {
          const res = await deleteFromApi(`attendance/${active.id}`, apiToken);
          if (res.success) {
            console.log("Rogue record deleted successfully.");
            loadAttendances();
          }
        })();
      }

      // Cari record terakhir yang benar-benar sudah selesai (Clock Out valid)
      const lastFinished = data.find(att => {
        const hasOutTime = att.out_time && 
                           !att.out_time.startsWith('0000') && 
                           !att.out_time.startsWith('-0001');
        return hasOutTime;
      });
      setLastFinishedAttendance(lastFinished || null);
    }
    setIsLoadingAttendances(false);
  };

  useEffect(() => {
    if (currentView === 'subpage' && apiToken) {
      if (subpageTitle === 'Project') loadProjects();
      else if (subpageTitle === 'Semua Task') loadTasks();
      else if (subpageTitle === 'Finance') loadExpenses();
      else if (subpageTitle === 'Jadwal') loadEvents(); 
      else if (subpageTitle === 'Absensi') {
        loadAttendances();
      } else if (subpageTitle === 'Tim') {
        loadAttendances();
        loadLeaves();
      }
      else if (subpageTitle === 'Notifikasi') {
        const loadNotif = async () => {
          setIsLoadingNotif(true);
          const res = await fetchFromApi('notifications', apiToken);
          if (res.success) setNotifications(Array.isArray(res.data) ? res.data : []);
          setIsLoadingNotif(false);
        };
        loadNotif();
      }
    }
  }, [subpageTitle, currentView, apiToken]);

  const handleProjectClick = (id: string, name: string) => {
    setActiveProjectId(id);
    setActiveProjectName(name);
    loadTasks(id);
    handleNav('subpage', null, 'Tasks');
  };

  const handleSaveProfile = async () => {
    if (!userData?.id || userData.id === '0') {
      showToast('Tidak bisa update profil di Dev Mode');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await putToApi(`users/${userData.id}`, apiToken, editForm);
      if (res.success) {
        const updatedUser = { ...userData, ...editForm };
        setUserData(updatedUser);
        localStorage.setItem('havia_user', JSON.stringify(updatedUser));
        showToast('Profil berhasil diperbarui! ✅');
        handleNav('subpage', null, 'Akun');
      } else { showToast(res.error || 'Gagal memperbarui profil.'); }
    } catch (error: any) { showToast(error.message || 'Terjadi kesalahan.'); }
    finally { setIsSavingProfile(false); }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!userData?.id || userData.id === '0') {
      showToast('Tidak bisa reset password di Dev Mode');
      return;
    }
    setIsResettingPassword(true);
    try {
      // Send more complete data as some APIs ignore partial updates for sensitive fields
      // and include 'retype_password' which is common in RISE CRM/CI environments
      const updateData = {
        password: newPassword,
        retype_password: newPassword,
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        email: userData?.email || '',
        user_type: userData?.user_type || 'staff'
      };

      const res = await putToApi(`users/${userData.id}`, apiToken, updateData);
      if (res.success) {
        showToast('Password berhasil diperbarui! 🔒');
        handleNav('subpage', null, 'Akun');
      } else { 
        showToast(res.error || 'Gagal reset password.'); 
      }
    } catch (error: any) { 
      showToast(error.message || 'Terjadi kesalahan.'); 
    } finally { 
      setIsResettingPassword(false); 
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start_date) {
      showToast('Judul dan Tanggal wajib diisi.');
      return;
    }
    setIsSavingEvent(true);
    try {
      const res = await postToApi('events', apiToken, newEvent);
      if (res.success) {
        showToast('Event berhasil dibuat! 📅');
        loadEvents();
        handleNav('subpage', null, 'Jadwal');
        setNewEvent({
          title: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          start_time: '08:00',
          location: '',
          color: '#C69C3D'
        });
      } else { showToast(res.error || 'Gagal menyimpan event.'); }
    } catch (e: any) { showToast(e.message || 'Error koneksi.'); }
    finally { setIsSavingEvent(false); }
  };

  const handleResetAttendance = async () => {
    if (!activeAttendance || !apiToken) return;
    if (!confirm('Hapus sesi absen ini? (Data di Brain akan dibersihkan)')) return;
    
    setIsSubmittingAttendance(true);
    const res = await deleteFromApi(`haviacms/attendance/${activeAttendance.id}`, apiToken);
    if (res.success) {
      showToast('Sesi absen berhasil direset! 🧹');
      setActiveAttendance(null);
      loadAttendances();
    } else {
      showToast(res.error || 'Gagal mereset sesi.');
    }
    setIsSubmittingAttendance(false);
  };

  const handleAddAttendance = async () => {
    if (!userData?.id || !apiToken) return;
    setIsSubmittingAttendance(true);
    
    // Format waktu UTC: YYYY-MM-DD HH:mm:ss (RISE CRM prefers UTC in DB)
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 19);

    try {
      if (activeAttendance) {
        // --- JUNK DETECTION ---
        const isJunk = activeAttendance.out_time?.startsWith('0000') || 
                       activeAttendance.out_time?.startsWith('-0001');

        if (isJunk) {
          showToast('Data rusak terdeteksi, membersihkan Brain... 🧹');
          const delRes = await deleteFromApi(`attendance/${activeAttendance.id}`, apiToken);
          if (delRes.success) {
            setActiveAttendance(null);
            loadAttendances();
            showToast('Havia Brain Bersih! Silahkan Clock In ulang. ✨');
          } else {
            showToast('Gagal membersihkan data rusak.');
          }
          return; // Stop di sini agar user bisa klik Clock In lagi setelah bersih
        }

        // --- CLOCK OUT (Update existing record via HaviaCMS) ---
        const res = await putToApi(`haviacms/attendance/${activeAttendance.id}`, apiToken, {
          out_time: formattedNow,
          status: 'pending',
          note: activeAttendance.note ? `${activeAttendance.note} | Clock out via Mobile` : 'Clock out via Mobile'
        });

        if (res.success) {
          showToast('Clock Out Berhasil! Sampai jumpa besok. 👋');
          loadAttendances();
        } else {
          showToast(res.error || 'Gagal Clock Out.');
        }
      } else {
        // --- AUTO-HEAL: Hapus record 'sampah' jika ada (Record dengan Out Time -0001 atau 0000) ---
        // Ini untuk membersihkan dashboard Brain Bapak dari durasi jutaan jam
        const rogueRecord = attendances.find(a => 
          a.out_time?.startsWith('0000') || a.out_time?.startsWith('-0001')
        );
        if (rogueRecord) {
          try {
            await deleteFromApi(`haviacms/attendance/${rogueRecord.id}`, apiToken);
          } catch (e) {
            console.error("Gagal membersihkan data sampah:", e);
          }
        }

        // --- CLOCK IN (Create new record via HaviaCMS) ---
        const res = await postToApi('haviacms/attendance', apiToken, {
          in_time: formattedNow,
          note: 'Clock in via Mobile (HaviaCMS API)'
        });

        if (res.success) {
          const resAny = res as any;
          const createdId = resAny.id || resAny.data?.id;
          
          // --- OPTIMISTIC UPDATE ---
          const mockActive = {
            id: createdId,
            user_id: userData.id,
            in_time: formattedNow,
            status: 'incomplete', 
            out_time: null
          };
          setActiveAttendance(mockActive);

          showToast('Clock In Berhasil! 🚀');
          loadAttendances();
        } else {
          showToast(res.error || 'Gagal Clock In.');
        }
      }
    } catch (e: any) {
      showToast('Error koneksi ke server.');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  // --- RENDER ---
  if (isCheckingAuth) {
    return (
      <div style={{ backgroundColor: colors.bg }} className="h-screen w-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-2 border-[#C69C3D] animate-spin mb-4"></div>
        <p className="text-[#C69C3D] text-[10px] font-bold uppercase tracking-widest animate-pulse">Autentikasi Havia...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bg, fontFamily: '"Open Sans", sans-serif' }} 
      className="text-white h-screen w-full overflow-hidden relative selection:bg-[#C69C3D] selection:text-black">

      <Toast msg={toastMsg} />

      {currentView === 'login' && (
        <LoginView 
          loginEmail={loginEmail} setLoginEmail={setLoginEmail}
          loginPassword={loginPassword} setLoginPassword={setLoginPassword}
          handleLogin={handleLogin} isLoading={isLoading} isCheckingAuth={isCheckingAuth}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardView 
          userData={userData} 
          currentTime={currentTime} 
          onNav={handleNav} 
          activeAttendance={activeAttendance} 
        />
      )}

      {currentView === 'id' && (
        <IDView userData={userData} onNav={handleNav} />
      )}

      {currentView === 'presensi' && (
        <PresensiView 
          onNav={handleNav} currentTime={currentTime} 
          handleAddAttendance={handleAddAttendance} 
          handleResetAttendance={handleResetAttendance}
          isSubmittingAttendance={isSubmittingAttendance}
          activeAttendance={activeAttendance} 
          lastFinishedAttendance={lastFinishedAttendance}
        />
      )}

      {currentView === 'subpage' && (
        <SubpageView 
          subpageTitle={subpageTitle}
          onNav={handleNav}
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          projectTasks={projectTasks}
          isLoadingTasks={isLoadingTasks}
          activeProjectName={activeProjectName}
          expenses={expenses}
          isLoadingExpenses={isLoadingExpenses}
          events={events}
          isLoadingEvents={isLoadingEvents}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          attendances={attendances}
          isLoadingAttendances={isLoadingAttendances}
          leaves={leaves}
          isLoadingLeaves={isLoadingLeaves}
          notifications={notifications}
          isLoadingNotif={isLoadingNotif}
          userData={userData}
          editForm={editForm}
          setEditForm={(form) => setEditForm(form)}
          isSavingProfile={isSavingProfile}
          handleSaveProfile={handleSaveProfile}
          isResettingPassword={isResettingPassword}
          handleResetPassword={handleResetPassword}
          onLogout={onLogout}
          showToast={showToast}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          handleCreateEvent={handleCreateEvent}
          isSavingEvent={isSavingEvent}
          onProjectClick={handleProjectClick}
        />
      )}

      {['dashboard', 'subpage', 'presensi'].includes(currentView) && (
        <BottomNav activeNav={activeNav} onNav={handleNav} />
      )}
    </div>
  );
}
