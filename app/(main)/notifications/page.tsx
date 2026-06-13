"use client";

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { NotifikasiContent } from '@/components/content/NotifikasiContent';
import { useAuth } from '@/app/providers/AuthProvider';
import { fetchFromApi, postToApi } from '@/app/actions';

export default function NotificationsPage() {
  const { apiToken } = useAuth();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (apiToken) {
      loadNotifications();
    }
  }, [apiToken]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFromApi('haviacms/notifications', apiToken);
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await postToApi(`haviacms/notifications/${id}/read`, apiToken, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await postToApi(`haviacms/notifications/read-all`, apiToken, {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageWrapper title="Notifications" backRoute="/dashboard">
      <NotifikasiContent 
        notifications={notifications}
        isLoading={isLoading}
      />
    </PageWrapper>
  );
}
