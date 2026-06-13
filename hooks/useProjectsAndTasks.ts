import { useState } from 'react';
import { fetchFromApi } from '@/app/actions';
import { isAdmin } from '@/lib/permissions';

interface UseProjectsAndTasksProps {
  apiToken: string;
  userData: any;
  showToast: (msg: string) => void;
}

export function useProjectsAndTasks({ apiToken, userData, showToast }: UseProjectsAndTasksProps) {
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
  const [currentTaskFilter, setCurrentTaskFilter] = useState('OVERDUE');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const loadProjects = async (status: string = 'ALL', page: number = 1, search: string = currentProjectSearch) => {
    if (!userData?.id || !apiToken) return;
    
    setCurrentProjectFilter(status);
    setCurrentProjectPage(page);
    setCurrentProjectSearch(search);
    
    const cacheKey = `havia_projects_${status}_${page}_${search}`;
    const cachedData = sessionStorage.getItem(cacheKey);
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
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: enriched, meta: res.meta }));
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
    const cachedDataStr = sessionStorage.getItem(cacheKey);
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
      sessionStorage.setItem(cacheKey, JSON.stringify({
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

  return {
    projects, setProjects,
    isLoadingProjects,
    projectPaginationMeta,
    currentProjectPage, setCurrentProjectPage,
    currentProjectFilter, setCurrentProjectFilter,
    currentProjectSearch, setCurrentProjectSearch,
    activeProjectId, setActiveProjectId,
    activeProjectName, setActiveProjectName,
    projectTasks, setProjectTasks,
    isLoadingTasks,
    taskPaginationMeta,
    currentTaskPage, setCurrentTaskPage,
    currentTaskFilter, setCurrentTaskFilter,
    activeTaskId, setActiveTaskId,
    loadProjects,
    loadTasks
  };
}
