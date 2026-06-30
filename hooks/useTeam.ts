import { useState } from 'react';
import { fetchFromApi } from '@/app/actions';
import { canSeeTeamDashboard } from '@/lib/permissions';

interface UseTeamProps {
  apiToken: string;
  userData: any;
}

export function useTeam({ apiToken, userData }: UseTeamProps) {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  const loadTeamMembers = async () => {
    // Keep RBAC exactly as it was
    if (!apiToken || !canSeeTeamDashboard(userData)) return;
    const cacheKey = 'swr_havia_teams';
    const cachedData = sessionStorage.getItem(cacheKey);
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
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingTeam(false);
  };

  return {
    teamMembers, setTeamMembers,
    isLoadingTeam,
    loadTeamMembers,
  };
}
