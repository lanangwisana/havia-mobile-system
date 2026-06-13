import { useState } from 'react';
import { fetchFromApi } from '@/app/actions';

interface UseEventsProps {
  apiToken: string;
  userData: any;
  showToast: (msg: string) => void;
}

export function useEvents({ apiToken, userData, showToast }: UseEventsProps) {
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

  const loadEvents = async (type: string = eventFilterType, label: string = eventFilterLabel, page: number = 1) => {
    if (!apiToken || !userData?.id) return;
    
    setEventFilterType(type);
    if (label !== undefined) setEventFilterLabel(label);
    setCurrentEventPage(page);

    const cacheKey = `havia_events_${type}_${label}_${page}`;
    const cachedData = sessionStorage.getItem(cacheKey);
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
      
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: eventsData, meta: res.meta }));
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

  return {
    events, setEvents,
    isLoadingEvents,
    selectedEvent, setSelectedEvent,
    newEvent, setNewEvent,
    isSavingEvent, setIsSavingEvent,
    eventLabels, setEventLabels,
    eventFilterType, setEventFilterType,
    eventFilterLabel, setEventFilterLabel,
    eventPaginationMeta, setEventPaginationMeta,
    currentEventPage, setCurrentEventPage,
    loadEvents,
    loadEventLabels
  };
}
