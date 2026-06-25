import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';

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
        return <div>Загрузка задач...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div>
            <h3>Проект: {projectKey}</h3>
            <p>Задач: {issues.length}</p>
            <ul>
                {issues.map((issue) => (
                    <li key={issue.key}>
                        <strong>{issue.key}</strong> — {issue.summary}
                        {' | '}
                        {issue.status}
                        {' | '}
                        {issue.assignee || 'без исполнителя'}
                        {' | '}
                        {issue.priority || 'без приоритета'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
