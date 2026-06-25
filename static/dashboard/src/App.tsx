import React, { useEffect, useMemo, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { Box, CircularProgress, Typography } from '@mui/material';
import StatsLegend from './components/StatsLegend';
import TasksTable from './TasksTable';
import { GetIssuesResult, isGetIssuesError } from './types/api';
import { Issue } from './types/issue';
import { countIssueProblems } from './utils/issueRules';

function App() {
    const [projectKey, setProjectKey] = useState<string | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

                if (isGetIssuesError(result)) {
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
            <Typography variant="h6" gutterBottom>
                Проект: {projectKey}
            </Typography>
            <StatsLegend
                total={issues.length}
                problemCounts={problemCounts}
            />
            <TasksTable issues={issues} />
        </Box>
    );
}

export default App;
