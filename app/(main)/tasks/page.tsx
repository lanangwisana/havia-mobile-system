"use client";

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TaskList } from '@/components/content/TaskList';
import { useProjectsAndTasks } from '@/hooks/useProjectsAndTasks';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSearchParams } from 'next/navigation';

export default function MyTasksPage() {
  const { apiToken, userData, showToast } = useAuth();
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get('taskId');
  
  const {
    projects, projectTasks, isLoadingTasks, taskPaginationMeta,
    currentTaskFilter, loadTasks
  } = useProjectsAndTasks({ apiToken, userData, showToast });

  const [activeFilter, setActiveFilter] = useState(currentTaskFilter);

  useEffect(() => {
    if (apiToken) {
      loadTasks(null, activeFilter, 1);
    }
  }, [apiToken, activeFilter]);

  return (
    <PageWrapper title="My Tasks" backRoute="/dashboard">
      <TaskList 
        tasks={projectTasks}
        isLoading={isLoadingTasks}
        projects={projects}
        paginationMeta={taskPaginationMeta}
        onPageChange={(p) => loadTasks(null, activeFilter, p)}
        onFilterChange={(s) => setActiveFilter(s)}
        highlightTaskId={highlightTaskId}
        currentFilter={activeFilter}
      />
    </PageWrapper>
  );
}
