import React, { useEffect, useMemo, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { Box, CircularProgress, Typography } from '@mui/material';
import AutoAssignConfirmDialog from './components/AutoAssignConfirmDialog';
import ControlPanel from './components/ControlPanel';
import AssignModal from './components/AssignModal';
import PriorityModal from './components/PriorityModal';
import TasksTable from './TasksTable';
import { AutoAssignResult, GetIssuesResult, isApiError } from './types/api';
import { ISSUE_PROBLEM, Issue, IssueProblemType } from './types/issue';
import { countIssueProblems } from './utils/issueRules';

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
        async function loadIssues() {
            try {
                const context = await view.getContext();
                const key = context?.extension?.project?.key;

                if (!key) {
                    setError('Не удалось определить ключ проекта из контекста Jira');
                    setLoading(false);
                    return;
                }

                setProjectKey(key);

                const result = await invoke('getIssues', { projectKey: key }) as GetIssuesResult;

                if (isApiError(result)) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }

                setIssues(result.issues || []);
            } catch (loadError) {
                const message = loadError instanceof Error
                    ? loadError.message
                    : 'Ошибка загрузки задач';
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        loadIssues();
    }, []);

    const problemCounts = useMemo(() => countIssueProblems(issues), [issues]);
    const unassignedCount = problemCounts[ISSUE_PROBLEM.UNASSIGNED];

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
            <ControlPanel
                total={issues.length}
                problemCounts={problemCounts}
                unassignedCount={unassignedCount}
                onAutoAssignClick={handleAutoAssignClick}
            />
            <TasksTable issues={issues} onFixClick={handleFixClick} />
        </Box>
    );
}

export default App;
