"use client";

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { ProjectTaskList } from '@/components/content/ProjectTaskList';
import { useProjectsAndTasks } from '@/hooks/useProjectsAndTasks';
import { useAuth } from '@/app/providers/AuthProvider';
import { useParams, useSearchParams } from 'next/navigation';

export default function ProjectTasksPage() {
  const { apiToken, userData, showToast } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const projectId = params.id as string;
  const projectName = searchParams.get('name') || 'Project Tasks';
  const highlightTaskId = searchParams.get('taskId');
  
  const {
    projectTasks, isLoadingTasks, taskPaginationMeta,
    currentTaskFilter, loadTasks
  } = useProjectsAndTasks({ apiToken, userData, showToast });

  const [activeFilter, setActiveFilter] = useState(currentTaskFilter);

  useEffect(() => {
    if (apiToken && projectId) {
      loadTasks(projectId, activeFilter, 1);
    }
  }, [apiToken, projectId, activeFilter]);

  return (
    <PageWrapper title="All Tasks" backRoute="/projects">
      <ProjectTaskList 
        tasks={projectTasks}
        isLoading={isLoadingTasks}
        projectName={projectName}
        paginationMeta={taskPaginationMeta}
        onPageChange={(p) => loadTasks(projectId, activeFilter, p)}
        highlightTaskId={highlightTaskId}
      />
    </PageWrapper>
  );
}
