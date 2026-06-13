"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { JadwalContent } from '@/components/content/JadwalContent';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const { apiToken, userData, showToast } = useAuth();
  const router = useRouter();
  
  const {
    events, isLoadingEvents, selectedEvent, setSelectedEvent,
    eventLabels, eventFilterType, setEventFilterType,
    eventFilterLabel, setEventFilterLabel, eventPaginationMeta,
    loadEvents, loadEventLabels
  } = useEvents({ apiToken, userData, showToast });

  useEffect(() => {
    if (apiToken) {
      loadEvents(eventFilterType, eventFilterLabel);
      if (eventLabels.length === 0) loadEventLabels();
    }
  }, [apiToken, eventFilterType, eventFilterLabel]);

  return (
    <PageWrapper title="Events" backRoute="/dashboard">
      <JadwalContent 
        events={events}
        isLoadingEvents={isLoadingEvents}
        onEventClick={(ev) => {
          setSelectedEvent(ev);
          // Assuming Event Detail is still inline or we can create a sub-route later
          // if there is an event detail page, we route there: router.push(`/events/${ev.id}`);
          // But JadwalContent might handle the modal itself if we pass it, or we can just leave it inline
        }}
        onCreateEvent={() => {}} // TODO: link to event creation if needed
        labels={eventLabels}
        filterType={eventFilterType}
        setFilterType={setEventFilterType}
        filterLabel={eventFilterLabel}
        setFilterLabel={setEventFilterLabel}
        paginationMeta={eventPaginationMeta}
        onPageChange={(p) => loadEvents(eventFilterType, eventFilterLabel, p)}
      />
    </PageWrapper>
  );
}
