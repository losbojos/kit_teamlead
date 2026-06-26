import React, { useEffect, useMemo, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import AutoAssignConfirmDialog from './components/AutoAssignConfirmDialog';
import ControlPanel from './components/ControlPanel';
import AssignModal from './components/AssignModal';
import PriorityModal from './components/PriorityModal';
import TeamTable from './components/TeamTable';
import TasksTable from './TasksTable';
import { AutoAssignResult, GetIssuesResult, GetProjectMembersResult, isApiError } from './types/api';
import { ISSUE_PROBLEM, Issue, IssueProblemType } from './types/issue';
import type { ProjectMember } from './shared/types/member';
import { countIssueProblems } from './utils/issueRules';
import { buildTeamMemberStats } from './utils/teamStats';
import { FORGE_TAB_STYLE, FORGE_TABS_ROOT_STYLE } from './styles/forgeInline';

interface FixTarget {
    issue: Issue;
    problemType: IssueProblemType;
}

function App() {
    const [projectKey, setProjectKey] = useState<string | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fixTarget, setFixTarget] = useState<FixTarget | null>(null);
    const [autoAssignOpen, setAutoAssignOpen] = useState(false);
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [autoAssignError, setAutoAssignError] = useState<string | null>(null);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
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

    const assignModalOpen = Boolean(
        fixTarget
        && fixTarget.problemType === ISSUE_PROBLEM.UNASSIGNED
        && projectKey,
    );

    const priorityModalOpen = Boolean(
        fixTarget
        && fixTarget.problemType === ISSUE_PROBLEM.LOW_PRIORITY_DEADLINE,
    );

    useEffect(() => {
        async function loadProjectData() {
            try {
                const context = await view.getContext();
                const key = context?.extension?.project?.key;

                if (!key) {
                    setError('Не удалось определить ключ проекта из контекста Jira');
                    setLoading(false);
                    setMembersLoading(false);
                    return;
                }

                setProjectKey(key);

                const [issuesResult, membersResult] = await Promise.all([
                    invoke('getIssues', { projectKey: key }) as Promise<GetIssuesResult>,
                    invoke('getProjectMembers', { projectKey: key }) as Promise<GetProjectMembersResult>,
                ]);

                if (isApiError(issuesResult)) {
                    setError(issuesResult.error);
                } else {
                    setIssues(issuesResult.issues || []);
                }

                if (isApiError(membersResult)) {
                    setMembersError(membersResult.error);
                } else {
                    setMembers(membersResult.members || []);
                }
            } catch (loadError) {
                const message = loadError instanceof Error
                    ? loadError.message
                    : 'Ошибка загрузки данных';
                setError(message);
            } finally {
                setLoading(false);
                setMembersLoading(false);
            }
        }

        loadProjectData();
    }, []);

    const problemCounts = useMemo(() => countIssueProblems(issues), [issues]);
    const unassignedCount = problemCounts[ISSUE_PROBLEM.UNASSIGNED];
    const teamStats = useMemo(
        () => buildTeamMemberStats(members, issues),
        [members, issues],
    );

    if (loading) {
        return (
            <Box display="flex" alignItems="center" gap={2} p={2}>
                <CircularProgress size={24} />
                <Typography>Загрузка задач...</Typography>
            </Box>
        );
    }

    if (error) {
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
            <Typography variant="h6" gutterBottom>
                Проект: {projectKey}
            </Typography>
            <Tabs
                value={activeTab}
                onChange={(_event, newValue: number) => setActiveTab(newValue)}
                style={FORGE_TABS_ROOT_STYLE}
            >
                <Tab label="Dashboard" style={FORGE_TAB_STYLE} />
                <Tab label="Team" />
            </Tabs>
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
        </Box>
    );
}

export default App;
