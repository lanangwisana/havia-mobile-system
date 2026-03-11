"use client";

import React, { useState, useEffect } from 'react';
import { 
  loginWithToken, 
  loginWithEmailPassword, 
  fetchFromApi, 
  putToApi, 
  postToApi 
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
            loginWithToken(savedToken).then(result => {
              if (result.success && result.data) {
                const users = result.data;
                let latestUser = null;
                if (Array.isArray(users)) {
                  latestUser = users.find((u: any) => u.email === savedUser.email);
                } else if (users && typeof users === 'object') {
                  if (users.email === savedUser.email) latestUser = users;
                }
                if (latestUser) {
                  setUserData(latestUser);
                  localStorage.setItem('havia_user', JSON.stringify(latestUser));
                }
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
        setUserData(res.data);
        setApiToken(res.token || '');
        localStorage.setItem('havia_user', JSON.stringify(res.data));
        localStorage.setItem('havia_token', res.token || '');
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
    if (!apiToken) return;
    setIsLoadingEvents(true);
    const res = await fetchFromApi('events', apiToken);
    if (res.success) setEvents(Array.isArray(res.data) ? res.data : []);
    setIsLoadingEvents(false);
  };

  const loadAttendances = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingAttendances(true);
    // Filter by staff user_id
    const res = await fetchFromApi(`attendance?user_id=${userData.id}`, apiToken);
    if (res.success) setAttendances(Array.isArray(res.data) ? res.data : []);
    setIsLoadingAttendances(false);
  };

  useEffect(() => {
    if (currentView === 'subpage' && apiToken) {
      if (subpageTitle === 'Project') loadProjects();
      else if (subpageTitle === 'Semua Task') loadTasks();
      else if (subpageTitle === 'Finance') loadExpenses();
      else if (subpageTitle === 'Jadwal') loadEvents();
      else if (subpageTitle === 'Absensi') loadAttendances();
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

  const handleAddAttendance = async () => {
    setIsSubmittingAttendance(true);
    try {
      const res = await postToApi('attendance', apiToken, {
        note: `Presensi via Mobile @ ${currentTime}`,
        status: 'present'
      });
      if (res.success) {
        showToast('Presensi berhasil dicatat! ✅');
        loadAttendances();
        handleNav('subpage', null, 'Absensi');
      } else { showToast(res.error || 'Gagal mencatat presensi.'); }
    } catch (e: any) { showToast(e.message || 'Error koneksi.'); }
    finally { setIsSubmittingAttendance(false); }
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
        <DashboardView userData={userData} currentTime={currentTime} onNav={handleNav} />
      )}

      {currentView === 'id' && (
        <IDView userData={userData} onNav={handleNav} />
      )}

      {currentView === 'presensi' && (
        <PresensiView 
          onNav={handleNav} currentTime={currentTime} 
          handleAddAttendance={handleAddAttendance} isSubmittingAttendance={isSubmittingAttendance} 
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
          notifications={notifications}
          isLoadingNotif={isLoadingNotif}
          userData={userData}
          editForm={editForm}
          setEditForm={(form) => setEditForm(form)}
          isSavingProfile={isSavingProfile}
          handleSaveProfile={handleSaveProfile}
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
