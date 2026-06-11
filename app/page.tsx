"use client";

import React, { useState, useEffect } from 'react';
import { 
  loginWithToken, 
  loginWithEmailPassword, 
  fetchFromApi, 
  putToApi, 
  postToApi,
  deleteFromApi,
  uploadAvatar,
  deleteAvatar,
  verifyUserStatus
} from './actions';

// Import Lib & Utils
import { colors } from '@/lib/utils';
import { canAccessProjects, canAccessFinance, canAccessTeam } from '@/lib/permissions';

// Import UI Components
import { Toast } from '@/components/ui/Toast';
import { BottomNav } from '@/components/ui/BottomNav';

// Import View Components
import { LoginView } from '@/components/views/LoginView';
import { DashboardView } from '@/components/views/DashboardView';
import { IDView } from '@/components/views/IDView';
import { PresensiView } from '@/components/views/PresensiView';
import { SubpageView } from '@/components/views/SubpageView';
import { LeaveModal } from '@/components/ui/LeaveModal';

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
  const [notifPaginationMeta, setNotifPaginationMeta] = useState<any>(null);
  const [currentNotifPage, setCurrentNotifPage] = useState(1);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [allNotifIds, setAllNotifIds] = useState<string[]>([]);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectPaginationMeta, setProjectPaginationMeta] = useState<any>(null);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [currentProjectFilter, setCurrentProjectFilter] = useState('ALL');
  const [currentProjectSearch, setCurrentProjectSearch] = useState('');
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskPaginationMeta, setTaskPaginationMeta] = useState<any>(null);
  const [currentTaskPage, setCurrentTaskPage] = useState(1);
  const [currentTaskFilter, setCurrentTaskFilter] = useState('ALL');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Edit Profile States
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

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
  const [eventLabels, setEventLabels] = useState<any[]>([]);
  const [eventFilterType, setEventFilterType] = useState('event');
  const [eventFilterLabel, setEventFilterLabel] = useState('');
  const [eventPaginationMeta, setEventPaginationMeta] = useState<any>(null);
  const [currentEventPage, setCurrentEventPage] = useState(1);

  // Expenses States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [financeSummary, setFinanceSummary] = useState<any[]>([]);
  const [isLoadingFinanceSummary, setIsLoadingFinanceSummary] = useState(false);
  const [financeSummaryMeta, setFinanceSummaryMeta] = useState<any>(null);
  const [currentFinanceSummaryPage, setCurrentFinanceSummaryPage] = useState(1);
  const [currentFinanceSearch, setCurrentFinanceSearch] = useState('');
  const [financeSummaryTotal, setFinanceSummaryTotal] = useState(0);
  const [financeTotals, setFinanceTotals] = useState<any>(null);
  const [expensesMeta, setExpensesMeta] = useState<any>(null);
  const [currentExpensesPage, setCurrentExpensesPage] = useState(1);
  const [expensesTotal, setExpensesTotal] = useState(0);

  // Team / Attendance
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any | null>(null);
  const [lastFinishedAttendance, setLastFinishedAttendance] = useState<any | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalType, setLeaveModalType] = useState<'izin' | 'cuti'>('izin');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // --- EFFECTS & HELPERS ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const isAdmin = (user: any) => String(user?.is_admin) === "1" || user?.role_id === "admin";

  const handleNav = (view: string, nav?: string | null, title: string = '', taskId: string | null = null) => {
    // SECURITY GUARD: Check status + sync permissions on every navigation
    if (apiToken && view !== 'login') {
      verifyUserStatus(apiToken).then(statusCheck => {
        if (!statusCheck.success && statusCheck.status === 'blocked') {
          showToast(statusCheck.message || 'Account disabled');
          handleLogout();
        } else if (statusCheck.success && (statusCheck as any).user?.permissions) {
          // Sync permissions from server (in case admin changed role)
          const syncedPerms = (statusCheck as any).user.permissions;
          setUserData((prev: any) => {
            if (!prev) return prev;
            const updated = { ...prev, permissions: syncedPerms };
            localStorage.setItem('havia_user', JSON.stringify(updated));
            return updated;
          });
        }
      });
    }

    // PERMISSION GUARD: Block navigation to modules without permission
    if (view === 'subpage' && title) {
      const guardMap: Record<string, (u: any) => boolean> = {
        'Project': canAccessProjects,
        'My Tasks': canAccessProjects,
        'Finance': canAccessFinance,
        'Team': canAccessTeam,
      };
      const checker = guardMap[title];
      if (checker && !checker(userData)) {
        showToast('You do not have permission to access this module.');
        return; // Block navigation
      }
    }

    setCurrentView(view);
    if (nav) {
      setActiveNav(nav);
    } else if (view === 'dashboard') {
      setActiveNav('home');
    }
    
    if (title) {
      setSubpageTitle(title);
      setActiveTaskId(taskId);
      
      // Reset projects pagination & filter when entering the main project list
      if (title === 'Project') {
        setCurrentProjectFilter('ALL');
        setCurrentProjectPage(1);
        setCurrentProjectSearch('');
      }
      if (title === 'My Tasks') {
        setCurrentTaskFilter('OVERDUE');
        setCurrentTaskPage(1);
        setActiveProjectId(null);
      } else if (title === 'All Tasks') {
        setCurrentTaskFilter('ALL');
        setCurrentTaskPage(1);
      }

      // Pre-fill edit form when entering Edit Profile
      if (title === 'Edit Profile' && userData) {
        setEditForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          job_title: userData.job_title || '',
          phone: userData.phone || '',
          address: userData.address || '',
          gender: userData.gender || 'male'
        });
      }
    }
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
                  const u = users as any;
                  if (u.email === savedUser.email) latestUser = u;
                }
                if (latestUser) {
                  setUserData(latestUser);
                  localStorage.setItem('havia_user', JSON.stringify(latestUser));
                }

                // Verify status + sync permissions and role info in background
                verifyUserStatus(savedToken).then(statusCheck => {
                  if (!statusCheck.success && statusCheck.status === 'blocked') {
                    showToast(statusCheck.message || 'Account disabled');
                    handleLogout();
                  } else if (statusCheck.success && (statusCheck as any).user) {
                    // Sync latest user info, job title, and permissions from server
                    const serverUser = (statusCheck as any).user;
                    setUserData((prev: any) => {
                      const updated = { ...prev, ...serverUser };
                      localStorage.setItem('havia_user', JSON.stringify(updated));
                      return updated;
                    });
                  }
                });
              } else {
                // If token invalid, logout
                handleLogout();
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

  const handleLogout = () => {
    localStorage.removeItem('havia_user');
    localStorage.removeItem('havia_token');
    setUserData(null);
    setApiToken('');
    setCurrentView('login');
    setActiveNav('home');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Email and Password are required.');
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
        showToast('Welcome!');
      } else {
        showToast(res.error || 'Login Failed. Please check your credentials.');
      }
    } catch (error: any) {
      showToast(error.message || 'Connection error occurred.');
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
    showToast('Logout Success');
  };

  // --- DATA FETCHING ---
  const loadProjects = async (status: string = 'ALL', page: number = 1, search: string = currentProjectSearch) => {
    if (!userData?.id || !apiToken) return;
    
    setCurrentProjectFilter(status);
    setCurrentProjectPage(page);
    setCurrentProjectSearch(search);
    
    const cacheKey = `havia_projects_${status}_${page}_${search}`;
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProjects(parsed.data);
        if (parsed.meta) setProjectPaginationMeta(parsed.meta);
        isUsingCache = true;
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }

    if (!isUsingCache) {
      setIsLoadingProjects(true);
    }
    
    console.log(`[LoadProjects] status=${status}, page=${page}`);

    let endpoint = `haviacms/projects?status=${status}&page=${page}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetchFromApi(endpoint, apiToken);

    if (res.success) {
      const projectPool = Array.isArray(res.data) ? res.data : [];
      
      const admin = isAdmin(userData);
      const myId = String(userData.id);

      const enriched = projectPool.map((p: any) => {
        // Priority logic for roles
        const isProjectPic = String(p.assigned_to) === myId;
        const pCollabs = p.collaborators ? String(p.collaborators).split(',').map((id: string) => id.trim()) : [];
        const isProjectCollab = pCollabs.includes(myId);

        if (admin) p.userRole = 'ADMIN';
        else if (isProjectPic) p.userRole = 'PIC';
        else if (isProjectCollab) p.userRole = 'KOLABORATOR';
        else p.userRole = 'TEAM MEMBER';

        return p;
      });

      setProjects(enriched);
      if (res.meta) {
        setProjectPaginationMeta(res.meta);
      }
      
      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({ data: enriched, meta: res.meta }));
    } else {
      if (!isUsingCache) {
        showToast(`Failed to load projects: ${res.error}`);
      }
    }
    
    setIsLoadingProjects(false);
  };

  const loadTasks = async (projectId: string | null = null, status: string = 'OVERDUE', page: number = 1) => {
    if (!userData?.id || !apiToken) return;
    
    setCurrentTaskFilter(status);
    setCurrentTaskPage(page);

    const cacheKey = `havia_tasks_${projectId || 'all'}_${status}_${page}`;
    const cachedDataStr = localStorage.getItem(cacheKey);
    let hasValidCache = false;

    if (cachedDataStr) {
      try {
        const cached = JSON.parse(cachedDataStr);
        if (cached && Array.isArray(cached.tasks)) {
          setProjectTasks(cached.tasks);
          if (cached.meta) setTaskPaginationMeta(cached.meta);
          hasValidCache = true;
          // Set loading to false instantly to show cached data without spinner
          setIsLoadingTasks(false); 
        }
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    if (!hasValidCache) {
      setIsLoadingTasks(true);
    }
    
    const myId = String(userData.id);
    let endpoint = `haviacms/tasks?status=${status}&page=${page}`;
    if (projectId) endpoint += `&project_id=${projectId}`;
    
    const res = await fetchFromApi(endpoint, apiToken);

    if (res.success) {
      const tasks = Array.isArray(res.data) ? res.data : [];
      const enrichedTasks = tasks.map((t: any) => {
        const isPic = String(t.assigned_to) === myId;
        const collabs = t.collaborators ? String(t.collaborators).split(',').map((id: string) => id.trim()) : [];
        const isCollab = collabs.includes(myId);
        
        if (isPic) t.userRole = 'PIC';
        else if (isCollab) t.userRole = 'COLLABORATOR';
        else t.userRole = 'TEAM MEMBER';
        
        return t;
      });
      
      setProjectTasks(enrichedTasks);
      if (res.meta) {
        setTaskPaginationMeta(res.meta);
      }
      
      // Update Cache silently
      localStorage.setItem(cacheKey, JSON.stringify({
        tasks: enrichedTasks,
        meta: res.meta || null
      }));
    } else {
      if (!hasValidCache) {
        showToast(`Failed to load tasks: ${res.error}`);
      }
    }
    setIsLoadingTasks(false);
  };

  const loadExpenses = async (page: number = 1) => {
    if (!apiToken) return;
    setCurrentExpensesPage(page);

    const cacheKey = `havia_finance_expenses_${page}`;
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setExpenses(parsed.data);
        if (parsed.meta) {
          setExpensesMeta(parsed.meta);
          setExpensesTotal(parsed.meta.total_items || 0);
        } else {
          setExpensesTotal(parsed.data?.length || 0);
        }
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingExpenses(true);
    }

    // Fetch specifically salaries for the logged-in user
    const res = await fetchFromApi(`haviacms/finance/salaries?page=${page}`, apiToken);
    if (res.success) {
      const expenseData = Array.isArray(res.data) ? res.data : [];
      setExpenses(expenseData);
      if (res.meta) {
        setExpensesMeta(res.meta);
        setExpensesTotal(res.meta.total_items || 0);
      } else {
        setExpensesTotal(expenseData.length);
      }
      localStorage.setItem(cacheKey, JSON.stringify({ data: expenseData, meta: res.meta }));
    }
    setIsLoadingExpenses(false);
  };

  const loadFinanceSummary = async (page: number = 1, search: string = currentFinanceSearch) => {
    if (!apiToken || !isAdmin(userData)) return;
    setCurrentFinanceSummaryPage(page);
    setCurrentFinanceSearch(search);
    
    const cacheKey = `havia_finance_summary_${page}_${search}`;
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setFinanceSummary(parsed.data);
        if (parsed.totals) setFinanceTotals(parsed.totals);
        if (parsed.meta) {
          setFinanceSummaryMeta(parsed.meta);
          setFinanceSummaryTotal(parsed.meta.total_items || 0);
        } else {
          setFinanceSummaryTotal(parsed.data?.length || 0);
        }
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingFinanceSummary(true);
    }
    
    let endpoint = `haviacms/finance/summary?page=${page}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetchFromApi(endpoint, apiToken);
    if (res.success) {
      const summaryData = Array.isArray(res.data) ? res.data : [];
      setFinanceSummary(summaryData);
      if (res.totals) {
        setFinanceTotals(res.totals);
      }
      if (res.meta) {
        setFinanceSummaryMeta(res.meta);
        setFinanceSummaryTotal(res.meta.total_items || 0);
      } else {
        setFinanceSummaryTotal(summaryData.length);
      }
      localStorage.setItem(cacheKey, JSON.stringify({ data: summaryData, totals: res.totals, meta: res.meta }));
    }
    setIsLoadingFinanceSummary(false);
  };

  const loadEvents = async (type: string = eventFilterType, label: string = eventFilterLabel, page: number = 1) => {
    if (!apiToken || !userData?.id) return;
    
    setEventFilterType(type);
    if (label !== undefined) setEventFilterLabel(label);
    setCurrentEventPage(page);

    const cacheKey = `havia_events_${type}_${label}_${page}`;
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setEvents(parsed.data);
        if (parsed.meta) setEventPaginationMeta(parsed.meta);
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingEvents(true);
    }
    
    let url = `haviacms/events?type=${type}&page=${page}`;
    if (label) {
      url += `&label_id=${label}`;
    }

    const res = await fetchFromApi(url, apiToken);
    
    if (res.success) {
      let eventsData = Array.isArray(res.data) ? res.data : [];
      
      if ((res as any).isFallback) {
        eventsData = eventsData.map((ev: any) => ({
          ...ev,
          title: `[FB] ${ev.title}`,
          isFallback: true
        }));
        const serverError = (res as any).serverErrorMessage;
        showToast(serverError ? `Server Error: ${serverError}` : 'Info: Displaying simulation data due to server issues.');
      }

      setEvents(eventsData);
      if (res.meta) setEventPaginationMeta(res.meta);
      
      localStorage.setItem(cacheKey, JSON.stringify({ data: eventsData, meta: res.meta }));
    } else {
      if (!isUsingCache) {
        setEvents([]);
        if (res.error) showToast(`Failed to sync schedule: ${res.error}`);
      }
    }
    setIsLoadingEvents(false);
  };

  const loadEventLabels = async () => {
    if (!apiToken) return;
    const res = await fetchFromApi('haviacms/events/labels', apiToken);
    if (res.success) {
      setEventLabels(Array.isArray(res.data) ? res.data : []);
    }
  };

  const loadLeaves = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leaves';
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setLeaves(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingLeaves(true);
    }

    const res = await fetchFromApi('haviacms/leaves', apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaves(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingLeaves(false);
  };

  const loadTeamMembers = async () => {
    if (!apiToken || !isAdmin(userData)) return;
    const cacheKey = 'swr_havia_teams';
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setTeamMembers(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingTeam(true);
    }

    const res = await fetchFromApi(`haviacms/teams?_t=${Date.now()}`, apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setTeamMembers(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingTeam(false);
  };

  const loadLeaveTypes = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leave_types';
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setLeaveTypes(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingLeaveTypes(true);
    }

    const res = await fetchFromApi('haviacms/leave_types', apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaveTypes(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingLeaveTypes(false);
  };

  const handleLeaveSubmit = async (data: any) => {
    if (!apiToken) return;
    setIsSubmittingLeave(true);
    const res = await postToApi('haviacms/leaves', apiToken, data);
    if (res.success) {
      showToast("Submission sent successfully!");
      setIsLeaveModalOpen(false);
      loadLeaves();
    } else {
      showToast(`Failed: ${(res as any).message || (res as any).error}`);
    }
    setIsSubmittingLeave(false);
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
      const active = data.find((att: any) => {
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
      const lastFinished = data.find((att: any) => {
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
    if (apiToken && (currentView === 'dashboard' || currentView === 'presensi')) {
      loadAttendances();
    }

    if (currentView === 'subpage' && apiToken) {
      if (subpageTitle === 'Project') loadProjects(currentProjectFilter, currentProjectPage);
      else if (subpageTitle === 'My Tasks') loadTasks(null, currentTaskFilter, currentTaskPage);
      else if (subpageTitle === 'Finance') {
        loadExpenses();
        if (isAdmin(userData)) {
          loadFinanceSummary(1, "");
        }
      }
      else if (subpageTitle === 'Project Summary History') {
        loadFinanceSummary(1, currentFinanceSearch);
      }
      else if (subpageTitle === 'Events') {
        loadEvents(eventFilterType, eventFilterLabel);
        if (eventLabels.length === 0) loadEventLabels();
      }
      else if (subpageTitle === 'Attendance') {
        loadAttendances();
      } else if (subpageTitle === 'Team') {
        loadAttendances();
        loadLeaves();
        loadLeaveTypes();
        if (isAdmin(userData)) loadTeamMembers();
      }
      else if (subpageTitle === 'Notifications') {
        loadNotifications(currentNotifPage);
      }
    }
  }, [subpageTitle, currentView, apiToken, eventFilterType, eventFilterLabel]);

  // Mark notifications as read when opening the notifications page
  useEffect(() => {
    if (subpageTitle === 'Notifications' && allNotifIds.length > 0) {
      const seenNotifsKey = `havia_read_notifs_${userData?.id || 'guest'}`;
      localStorage.setItem(seenNotifsKey, JSON.stringify(allNotifIds));
      setUnreadNotifCount(0);
    }
  }, [subpageTitle, allNotifIds, userData]);

  const loadNotifications = async (page = 1) => {
    if (!apiToken) return;
    
    // SWR FIX: Ambil ID dari localStorage untuk menghindari stale state closure pada saat background sync
    let currentUserId = userData?.id;
    if (!currentUserId) {
      try {
        const savedUserStr = localStorage.getItem('havia_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          currentUserId = savedUser?.id;
        }
      } catch (e) {}
    }
    const finalUserId = currentUserId || 'guest';

    const cacheKey = `havia_notif_${finalUserId}_${page}`;
    const cachedData = localStorage.getItem(cacheKey);
    let isUsingCache = false;
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setNotifications(parsed.data);
        if (parsed.meta) {
            setNotifPaginationMeta(parsed.meta);
            if (parsed.meta.unread_count !== undefined) setUnreadNotifCount(parsed.meta.unread_count);
            if (parsed.meta.all_ids !== undefined) setAllNotifIds(parsed.meta.all_ids);
        }
        isUsingCache = true;
        setIsLoadingNotif(false);
      } catch(e) {}
    }
    
    if (!isUsingCache) {
      setIsLoadingNotif(true);
    }
    
    // Read cached seen notifs
    const seenNotifsKey = `havia_read_notifs_${finalUserId}`;
    let readIdsParam = '';
    try {
        const seenNotifs = localStorage.getItem(seenNotifsKey);
        if (seenNotifs) {
            const parsedSeen = JSON.parse(seenNotifs);
            if (Array.isArray(parsedSeen)) {
                readIdsParam = '&read_ids=' + parsedSeen.join(',');
            }
        }
    } catch(e) {}
    
    const res = await fetchFromApi(`haviacms/notifications?page=${page}${readIdsParam}`, apiToken);
    if (res.success) {
      const freshData = Array.isArray(res.data) ? res.data : [];
      setNotifications(freshData);
      if (res.meta) {
          setNotifPaginationMeta(res.meta);
          if (res.meta.unread_count !== undefined) setUnreadNotifCount(res.meta.unread_count);
          if (res.meta.all_ids !== undefined) setAllNotifIds(res.meta.all_ids);
      }
      localStorage.setItem(cacheKey, JSON.stringify({ data: freshData, meta: res.meta }));
    }
    setIsLoadingNotif(false);
  };
  
  const syncUserProfile = async () => {
    if (!apiToken) return;
    try {
      const res = await fetchFromApi('haviacms/profile/verify_status', apiToken);
      if (res.success && res.user) {
        setUserData(res.user);
        localStorage.setItem('havia_user', JSON.stringify(res.user));
      }
    } catch (e) {}
  };

  // Periodic Refresh
  useEffect(() => {
    if (apiToken) {
      syncUserProfile();
      loadNotifications();
      // Refresh every 5 minutes
      const interval = setInterval(() => {
        syncUserProfile();
        loadNotifications();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [apiToken]);

  const handleProjectClick = (id: string, name: string, taskId: string | null = null) => {
    setActiveProjectId(id);
    setActiveProjectName(name);
    loadTasks(id, 'ALL', 1);
    handleNav('subpage', null, 'All Tasks', taskId);
  };

  const handleSaveProfile = async () => {
    if (!userData?.id || userData.id === '0') {
      showToast('Tidak bisa update profil di Dev Mode');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await putToApi('haviacms/profile/update', apiToken, editForm);
      if (res.success) {
        const updatedUser = { ...userData, ...editForm };
        setUserData(updatedUser);
        localStorage.setItem('havia_user', JSON.stringify(updatedUser));
        showToast('Profile updated successfully! ✅');
        handleNav('subpage', null, 'Account');
      } else { showToast(res.error || 'Failed to update profile.'); }
    } catch (error: any) { showToast(error.message || 'An error occurred.'); }
    finally { setIsSavingProfile(false); }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Gunakan server action agar terhindar dari CORS browser
      const res = await uploadAvatar(apiToken, formData);
      
      if (res.success) {
        const updatedUser = { ...userData, image: res.image };
        setUserData(updatedUser);
        localStorage.setItem('havia_user', JSON.stringify(updatedUser));
        showToast('Profile updated successfully');
      } else {
        showToast(res.error || 'Failed to upload photo.');
      }
    } catch (error: any) {
      showToast(error.message || 'Connection error occurred.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsDeletingImage(true);
    try {
      const res = await deleteAvatar(apiToken);
      if (res.success) {
        const updatedUser = { ...userData, image: "" };
        setUserData(updatedUser);
        localStorage.setItem('havia_user', JSON.stringify(updatedUser));
        showToast('Profile updated successfully');
      } else {
        showToast(res.error || 'Failed to delete photo.');
      }
    } catch (error: any) {
      showToast(error.message || 'Connection error occurred.');
    } finally {
      setIsDeletingImage(false);
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
        showToast('Event created successfully! 📅');
        loadEvents();
        handleNav('subpage', null, 'Schedule');
        setNewEvent({
          title: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          start_time: '08:00',
          location: '',
          color: '#C69C3D'
        });
      } else { showToast(res.error || 'Failed to save event.'); }
    } catch (e: any) { showToast(e.message || 'Connection error.'); }
    finally { setIsSavingEvent(false); }
  };

  const handleResetAttendance = async () => {
    if (!activeAttendance || !apiToken) return;
    if (!confirm('Hapus sesi absen ini? (Data di Brain akan dibersihkan)')) return;
    
    setIsSubmittingAttendance(true);
    const res = await deleteFromApi(`haviacms/attendance/${activeAttendance.id}`, apiToken);
    if (res.success) {
      showToast('Attendance session reset successfully! 🧹');
      setActiveAttendance(null);
      loadAttendances();
    } else {
      showToast(res.error || 'Failed to reset session.');
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
          showToast('Corrupted data detected, cleaning Brain... 🧹');
          const delRes = await deleteFromApi(`attendance/${activeAttendance.id}`, apiToken);
          if (delRes.success) {
            setActiveAttendance(null);
            loadAttendances();
            showToast('Havia Brain Cleaned! Please Clock In again. ✨');
          } else {
            showToast('Failed to clean corrupted data.');
          }
          return; // Stop di sini agar user bisa klik Clock In lagi setelah bersih
        }

        // --- CLOCK OUT (Update existing record via HaviaCMS) ---
        const res = await putToApi(`haviacms/attendance/${activeAttendance.id}`, apiToken, {
          out_time: formattedNow,
          status: 'pending',
          note: 'Clock out via Mobile'
        });

        if (res.success) {
          showToast('Clock Out Success! See you tomorrow. 👋');
          loadAttendances();
        } else {
          showToast(res.error || 'Failed to Clock Out.');
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
          note: '' // Biarkan kosong agar di Brain tidak muncul teks otomatis
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

          showToast('Clock In Success! 🚀');
          loadAttendances();
        } else {
          showToast(res.error || 'Failed to Clock In.');
        }
      }
    } catch (e: any) {
      showToast('Error koneksi ke server.');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  // Reload events when filters change
  useEffect(() => {
    if (apiToken && currentView === 'subpage' && subpageTitle === 'Events') {
      loadEvents(eventFilterType, eventFilterLabel, 1);
    }
  }, [eventFilterType, eventFilterLabel]);

  // --- RENDER ---
  if (isCheckingAuth) {
    return (
      <div style={{ backgroundColor: colors.primary }} className="h-screen w-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-2 border-[#C69C3D] animate-spin mb-4"></div>
        <p className="text-[#C69C3D] text-[0.625rem] font-bold uppercase tracking-widest animate-pulse">Autentikasi Havia...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.primary, fontFamily: 'var(--font-sans)' }} 
      className="text-dark h-screen w-full overflow-hidden relative selection:bg-gold selection:text-black">


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
          notifications={notifications}
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
          taskPaginationMeta={taskPaginationMeta}
          onTaskPageChange={(p: number) => {
            setActiveTaskId(null);
            const pId = subpageTitle === 'My Tasks' ? null : activeProjectId;
            loadTasks(pId, currentTaskFilter, p);
          }}
          onTaskFilterChange={(s: string) => {
            setActiveTaskId(null);
            const pId = subpageTitle === 'My Tasks' ? null : activeProjectId;
            loadTasks(pId, s, 1);
          }}
          activeProjectName={activeProjectName}
          activeTaskId={activeTaskId}
          onProjectClick={handleProjectClick}
          projectPaginationMeta={projectPaginationMeta}
          onProjectPageChange={(p: number) => loadProjects(currentProjectFilter, p, currentProjectSearch)}
          onProjectFilterChange={(s: string) => loadProjects(s, 1, currentProjectSearch)}
          currentProjectSearch={currentProjectSearch}
          onProjectSearch={(search: string) => loadProjects(currentProjectFilter, 1, search)}
          expenses={expenses}
          isLoadingExpenses={isLoadingExpenses}
          expensesPaginationMeta={expensesMeta}
          onExpensesPageChange={(p: number) => loadExpenses(p)}
          financeSummary={financeSummary}
          financeTotals={financeTotals}
          isLoadingFinanceSummary={isLoadingFinanceSummary}
          financeSummaryPaginationMeta={financeSummaryMeta}
          onFinanceSummaryPageChange={(p: number) => loadFinanceSummary(p, currentFinanceSearch)}
          currentFinanceSearch={currentFinanceSearch}
          onFinanceSearch={(search: string) => loadFinanceSummary(1, search)}
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
          notifPaginationMeta={notifPaginationMeta}
          onNotifPageChange={(p: number) => {
            setCurrentNotifPage(p);
            loadNotifications(p);
          }}
          userData={userData}
          teamMembers={teamMembers}
          isLoadingTeam={isLoadingTeam}
          onFinanceViewAll={() => {
            setSubpageTitle('Project Summary History');
            loadFinanceSummary(1, "");
          }}
          onFinanceHistory={() => {
            setSubpageTitle('Payment History');
            loadExpenses(1);
          }}
          onFinanceBack={() => {
            setSubpageTitle('Finance');
            loadFinanceSummary(1, "");
            loadExpenses(1);
          }}
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
          apiToken={apiToken}
          onUploadImage={handleUploadImage}
          isUploadingImage={isUploadingImage}
          onDeleteImage={handleDeleteImage}
          isDeletingImage={isDeletingImage}
          eventLabels={eventLabels}
          eventFilterType={eventFilterType}
          setEventFilterType={setEventFilterType}
          eventFilterLabel={eventFilterLabel}
          setEventFilterLabel={setEventFilterLabel}
          eventPaginationMeta={eventPaginationMeta}
          onEventPageChange={(p: number) => loadEvents(eventFilterType, eventFilterLabel, p)}
          onOpenLeaveModal={(type) => {
            setLeaveModalType(type);
            setIsLeaveModalOpen(true);
          }}
        />
      )}

      {['dashboard', 'subpage', 'presensi'].includes(currentView) && (
        <BottomNav activeNav={activeNav} onNav={handleNav} />
      )}

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveTypes={leaveTypes}
        type={leaveModalType}
        isSubmitting={isSubmittingLeave}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  );
}
