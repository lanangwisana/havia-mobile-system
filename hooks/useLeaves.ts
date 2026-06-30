import { useState } from 'react';
import { fetchFromApi, postToApi } from '@/app/actions';

interface UseLeavesProps {
  apiToken: string;
  showToast: (msg: string) => void;
}

export function useLeaves({ apiToken, showToast }: UseLeavesProps) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalType, setLeaveModalType] = useState<'izin' | 'cuti'>('izin');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const loadLeaves = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leaves';
    const cachedData = sessionStorage.getItem(cacheKey);
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
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingLeaves(false);
  };

  const loadLeaveTypes = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leave_types';
    const cachedData = sessionStorage.getItem(cacheKey);
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
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
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

  return {
    leaves, setLeaves,
    isLoadingLeaves,
    leaveTypes, setLeaveTypes,
    isLoadingLeaveTypes,
    isLeaveModalOpen, setIsLeaveModalOpen,
    leaveModalType, setLeaveModalType,
    isSubmittingLeave, setIsSubmittingLeave,
    loadLeaves,
    loadLeaveTypes,
    handleLeaveSubmit,
  };
}
