"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useFinance } from '@/hooks/useFinance';
import { useProjectsAndTasks } from '@/hooks/useProjectsAndTasks';
import { useEvents } from '@/hooks/useEvents';
import { useTeamAttendance } from '@/hooks/useTeamAttendance';
import { Toast } from '@/components/ui/Toast';
import { canAccessProjects, canAccessFinance, canAccessTeam } from '@/lib/permissions';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState('login');
  const [activeNav, setActiveNav] = useState('home');
  const [subpageTitle, setSubpageTitle] = useState('');
  
  const [currentTime, setCurrentTime] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);
  const [notifPaginationMeta, setNotifPaginationMeta] = useState<any>(null);
  const [currentNotifPage, setCurrentNotifPage] = useState(1);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [allNotifIds, setAllNotifIds] = useState<string[]>([]);

  // Edit Profile States
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

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

  const auth = useAppAuth({
    showToast,
    onNavReset: (view, nav) => {
      setCurrentView(view);
      setActiveNav(nav);
    }
  });

  const finance = useFinance({ apiToken: auth.apiToken, userData: auth.userData });
  const projectsAndTasks = useProjectsAndTasks({ apiToken: auth.apiToken, userData: auth.userData, showToast });
  const eventsData = useEvents({ apiToken: auth.apiToken, userData: auth.userData, showToast });
  const teamAttendance = useTeamAttendance({ apiToken: auth.apiToken, userData: auth.userData, showToast });

  const handleNav = (view: string, nav?: string | null, title: string = '', taskId: string | null = null) => {
    // SECURITY GUARD: Check status + sync permissions on every navigation
    if (auth.apiToken && view !== 'login') {
      import('@/app/actions').then(({ verifyUserStatus }) => {
        verifyUserStatus(auth.apiToken).then(statusCheck => {
          if (!statusCheck.success && statusCheck.status === 'blocked') {
            showToast(statusCheck.message || 'Account disabled');
            auth.handleLogout();
          } else if (statusCheck.success && (statusCheck as any).user?.permissions) {
            const syncedPerms = (statusCheck as any).user.permissions;
            auth.setUserData((prev: any) => {
              if (!prev) return prev;
              const updated = { ...prev, permissions: syncedPerms };
              localStorage.setItem('havia_user', JSON.stringify(updated));
              return updated;
            });
          }
        });
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
      if (checker && !checker(auth.userData)) {
        showToast('You do not have permission to access this module.');
        return; // Block navigation
      }
    }

    setCurrentView(view);
    if (nav) {
      setActiveNav(nav);
    }
    if (view === 'subpage') {
      setSubpageTitle(title);
      
      // Auto load data based on subpage title
      if (title === 'Project') {
        projectsAndTasks.loadProjects(projectsAndTasks.currentProjectFilter, projectsAndTasks.currentProjectPage);
      } else if (title === 'My Tasks') {
        projectsAndTasks.loadTasks(null, projectsAndTasks.currentTaskFilter, projectsAndTasks.currentTaskPage);
      } else if (title === 'Finance') {
        finance.loadExpenses();
        import('@/lib/permissions').then(({ canSeeProjectSummary }) => {
          if (canSeeProjectSummary(auth.userData)) {
            finance.loadFinanceSummary(1, "");
          }
        });
      } else if (title === 'Events') {
        eventsData.loadEvents(eventsData.eventFilterType, eventsData.eventFilterLabel);
        if (eventsData.eventLabels.length === 0) eventsData.loadEventLabels();
      } else if (title === 'Team' || title === 'Attendance') {
        teamAttendance.loadAttendances();
        if (title === 'Team') {
          teamAttendance.loadLeaves();
          teamAttendance.loadLeaveTypes();
          import('@/lib/permissions').then(({ isAdmin }) => {
            if (isAdmin(auth.userData)) teamAttendance.loadTeamMembers();
          });
        }
      } else if (title === 'Edit Profile') {
        setEditForm({
          name: auth.userData?.name || '',
          email: auth.userData?.email || '',
          password: '',
          confirm_password: '',
          phone: auth.userData?.phone || '',
          address: auth.userData?.address || ''
        });
      }
    }
    if (taskId) {
      projectsAndTasks.setActiveTaskId(taskId);
    }
  };

  const contextValue = {
    currentView, setCurrentView,
    activeNav, setActiveNav,
    subpageTitle, setSubpageTitle,
    currentTime,
    toastMsg, showToast,
    handleNav,
    
    // Notifications State
    notifications, setNotifications,
    isLoadingNotif, setIsLoadingNotif,
    notifPaginationMeta, setNotifPaginationMeta,
    currentNotifPage, setCurrentNotifPage,
    unreadNotifCount, setUnreadNotifCount,
    allNotifIds, setAllNotifIds,
    
    // Edit Profile State
    editForm, setEditForm,
    isSavingProfile, setIsSavingProfile,
    isUploadingImage, setIsUploadingImage,
    isDeletingImage, setIsDeletingImage,

    ...auth,
    ...finance,
    ...projectsAndTasks,
    ...eventsData,
    ...teamAttendance,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <Toast msg={toastMsg} />
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
