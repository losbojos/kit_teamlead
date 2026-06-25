import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';

const resolver = new Resolver();

/**
 * Преобразует задачу из ответа Jira REST API в компактный объект для UI.
 */
function mapIssue(issue) {
    const fields = issue.fields || {};

    return {
        key: issue.key,
        summary: fields.summary || '',
        status: fields.status?.name || 'Unknown',
        assignee: fields.assignee?.displayName || null,
        assigneeAccountId: fields.assignee?.accountId || null,
        priority: fields.priority?.name || null,
        priorityId: fields.priority?.id || null,
        dueDate: fields.duedate || null,
    };
}

/**
 * Загружает задачи проекта через Jira REST API v3.
 * Вызывается из Custom UI: invoke('getIssues', { projectKey }).
 */
resolver.define('getIssues', async (req) => {
    const { projectKey } = req.payload || {};

    if (!projectKey) {
        return { error: 'Не указан projectKey' };
    }

    try {
        const jql = `project = "${projectKey}" ORDER BY created DESC`;
        const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jql,
                fields: ['summary', 'status', 'assignee', 'priority', 'duedate'],
            }),
        });

        if (!response.ok) {
            const details = await response.text();
            console.error('Jira search failed:', response.status, details);
            return { error: `Ошибка Jira API (${response.status})` };
        }

        const data = await response.json();

        return {
            issues: (data.issues || []).map(mapIssue),
        };
    } catch (error) {
        console.error('getIssues failed:', error);
        return { error: error.message || 'Не удалось загрузить задачи' };
    }
});

export const handler = resolver.getDefinitions();
