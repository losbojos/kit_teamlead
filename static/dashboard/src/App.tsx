import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import AutoAssignConfirmDialog from './components/AutoAssignConfirmDialog';
import ControlPanel from './components/ControlPanel';
import AssignModal from './components/AssignModal';
import PriorityModal from './components/PriorityModal';
import ProjectSelect from './components/ProjectSelect';
import TeamTable from './components/TeamTable';
import TasksTable from './TasksTable';
import {
    AutoAssignResult,
    GetIssuesResult,
    GetProjectMembersResult,
    GetProjectsResult,
    isApiError,
} from './types/api';
import { ISSUE_PROBLEM, Issue, IssueProblemType } from './types/issue';
import type { ProjectMember } from './shared/types/member';
import type { Project } from './shared/types/project';
import { countIssueProblems } from './utils/issueRules';
import { buildTeamMemberStats } from './utils/teamStats';
import { FORGE_HEADER_ROW_STYLE, FORGE_TAB_STYLE, FORGE_TABS_ROOT_STYLE } from './styles/forgeInline';

interface FixTarget {
    issue: Issue;
    problemType: IssueProblemType;
}

function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectKey, setProjectKey] = useState<string | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [initLoading, setInitLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [fixTarget, setFixTarget] = useState<FixTarget | null>(null);
    const [autoAssignOpen, setAutoAssignOpen] = useState(false);
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [autoAssignError, setAutoAssignError] = useState<string | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleFixClick = (issue: Issue, problemType: IssueProblemType) => {
        setFixTarget({ issue, problemType });
    };

    const handleFixModalClose = () => {
        setFixTarget(null);
    };

    const handleIssueUpdated = (updatedIssue: Issue) => {
        setIssues((prev) => prev.map((item) => (
            item.key === updatedIssue.key ? updatedIssue : item
        )));
        setFixTarget(null);
    };

    const handleAutoAssignClick = () => {
        setAutoAssignError(null);
        setAutoAssignOpen(true);
    };

    const handleAutoAssignClose = () => {
        if (!autoAssigning) {
            setAutoAssignOpen(false);
            setAutoAssignError(null);
        }
    };

    const handleAutoAssignConfirm = async () => {
        if (!projectKey) {
            return;
        }

        setAutoAssigning(true);
        setAutoAssignError(null);

        try {
            const result = await invoke('autoAssignUnassigned', { projectKey }) as AutoAssignResult;

            if (isApiError(result)) {
                setAutoAssignError(result.error);
                return;
            }

            setIssues((prev) => {
                const updatedByKey = new Map(result.issues.map((item) => [item.key, item]));
                return prev.map((item) => updatedByKey.get(item.key) ?? item);
            });
            setAutoAssignOpen(false);
        } catch (assignError) {
            const message = assignError instanceof Error
                ? assignError.message
                : 'Не удалось выполнить auto-assign';
            setAutoAssignError(message);
        } finally {
            setAutoAssigning(false);
        }
    };

    const loadProjectData = useCallback(async (key: string) => {
        setDataLoading(true);
        setMembersLoading(true);
        setMembersError(null);
        setError(null);
        setFixTarget(null);
        setAutoAssignOpen(false);

        try {
            const [issuesResult, membersResult] = await Promise.all([
                invoke('getIssues', { projectKey: key }) as Promise<GetIssuesResult>,
                invoke('getProjectMembers', { projectKey: key }) as Promise<GetProjectMembersResult>,
            ]);

            if (isApiError(issuesResult)) {
                setError(issuesResult.error);
                setIssues([]);
            } else {
                setIssues(issuesResult.issues || []);
            }

            if (isApiError(membersResult)) {
                setMembersError(membersResult.error);
                setMembers([]);
            } else {
                setMembers(membersResult.members || []);
            }
        } catch (loadError) {
            const message = loadError instanceof Error
                ? loadError.message
                : 'Ошибка загрузки данных проекта';
            setError(message);
        } finally {
            setDataLoading(false);
            setMembersLoading(false);
        }
    }, []);

    const handleProjectChange = (key: string) => {
        setProjectKey(key);
    };

    useEffect(() => {
        async function initApp() {
            try {
                const [context, projectsResult] = await Promise.all([
                    view.getContext(),
                    invoke('getProjects') as Promise<GetProjectsResult>,
                ]);

                if (isApiError(projectsResult)) {
                    setError(projectsResult.error);
                    return;
                }

                const projectList = projectsResult.projects || [];
                setProjects(projectList);

                if (projectList.length === 0) {
                    setError('Нет доступных проектов');
                    return;
                }

                const contextKey = context?.extension?.project?.key;
                const initialKey = contextKey
                    && projectList.some((project) => project.key === contextKey)
                    ? contextKey
                    : projectList[0].key;

                setProjectKey(initialKey);
            } catch (initError) {
                const message = initError instanceof Error
                    ? initError.message
                    : 'Ошибка инициализации';
                setError(message);
            } finally {
                setInitLoading(false);
            }
        }

        initApp();
    }, []);

    useEffect(() => {
        if (!projectKey || initLoading) {
            return;
        }

        loadProjectData(projectKey);
    }, [projectKey, initLoading, loadProjectData]);

    const assignModalOpen = Boolean(
        fixTarget
        && fixTarget.problemType === ISSUE_PROBLEM.UNASSIGNED
        && projectKey,
    );

    const priorityModalOpen = Boolean(
        fixTarget
        && fixTarget.problemType === ISSUE_PROBLEM.LOW_PRIORITY_DEADLINE,
    );

    const problemCounts = useMemo(() => countIssueProblems(issues), [issues]);
    const unassignedCount = problemCounts[ISSUE_PROBLEM.UNASSIGNED];
    const teamStats = useMemo(
        () => buildTeamMemberStats(members, issues),
        [members, issues],
    );

    if (initLoading) {
        return (
            <Box display="flex" alignItems="center" gap={2} p={2}>
                <CircularProgress size={24} />
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }

    if (error && !projectKey) {
        return (
            <Box p={2}>
                <Typography color="error">Ошибка: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            {projectKey && (
                <AssignModal
                    open={assignModalOpen}
                    issue={fixTarget?.issue ?? null}
                    projectKey={projectKey}
                    onClose={handleFixModalClose}
                    onAssigned={handleIssueUpdated}
                />
            )}
            <PriorityModal
                open={priorityModalOpen}
                issue={fixTarget?.issue ?? null}
                issues={issues}
                onClose={handleFixModalClose}
                onUpdated={handleIssueUpdated}
            />
            {projectKey && (
                <AutoAssignConfirmDialog
                    open={autoAssignOpen}
                    count={unassignedCount}
                    loading={autoAssigning}
                    error={autoAssignError}
                    onClose={handleAutoAssignClose}
                    onConfirm={handleAutoAssignConfirm}
                />
            )}
            <div style={FORGE_HEADER_ROW_STYLE}>
                <ProjectSelect
                    projects={projects}
                    projectKey={projectKey}
                    disabled={dataLoading}
                    onProjectChange={handleProjectChange}
                />
            </div>
            <Tabs
                value={activeTab}
                onChange={(_event, newValue: number) => setActiveTab(newValue)}
                style={FORGE_TABS_ROOT_STYLE}
            >
                <Tab label="Dashboard" style={FORGE_TAB_STYLE} />
                <Tab label="Team" />
            </Tabs>
            {dataLoading ? (
                <Box display="flex" alignItems="center" gap={2} py={2}>
                    <CircularProgress size={22} />
                    <Typography variant="body2">Загрузка данных проекта...</Typography>
                </Box>
            ) : (
                <>
                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            Ошибка: {error}
                        </Typography>
                    )}
                    {activeTab === 0 && (
                        <>
                            <ControlPanel
                                total={issues.length}
                                problemCounts={problemCounts}
                                unassignedCount={unassignedCount}
                                onAutoAssignClick={handleAutoAssignClick}
                            />
                            <TasksTable issues={issues} onFixClick={handleFixClick} />
                        </>
                    )}
                    {activeTab === 1 && (
                        <TeamTable
                            members={teamStats}
                            loading={membersLoading}
                            error={membersError}
                        />
                    )}
                </>
            )}
        </Box>
    );
}

export default App;
