import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import { Box, CircularProgress, Typography } from '@mui/material';
import TasksTable from './TasksTable';

function App() {
    const [projectKey, setProjectKey] = useState(null);
    const [issues, setIssues] = useState([]);
    const [error, setError] = useState(null);
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

                const result = await invoke('getIssues', { projectKey: key });

                if (result?.error) {
                    setError(result.error);
                    setLoading(false);
                    return;
                }

                setIssues(result?.issues || []);
            } catch (loadError) {
                setError(loadError.message || 'Ошибка загрузки задач');
            } finally {
                setLoading(false);
            }
        }

        loadIssues();
    }, []);

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
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Задач: {issues.length}
            </Typography>
            <TasksTable issues={issues} />
        </Box>
    );
}

export default App;
