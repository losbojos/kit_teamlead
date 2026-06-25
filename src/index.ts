import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';
import type { GetIssuesError, GetIssuesSuccess } from '../shared/types/api';
import type { Issue } from '../shared/types/issue';
import type { JiraIssue, JiraSearchJqlResponse } from './types/jira';

const resolver = new Resolver();

interface GetIssuesPayload {
    projectKey?: string;
}

/**
 * Преобразует задачу из ответа Jira REST API в компактный объект для UI.
 */
function mapIssue(issue: JiraIssue): Issue {
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
resolver.define('getIssues', async (req): Promise<GetIssuesSuccess | GetIssuesError> => {
    const { projectKey } = (req.payload || {}) as GetIssuesPayload;

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

        const data = await response.json() as JiraSearchJqlResponse;

        return {
            issues: (data.issues || []).map(mapIssue),
        };
    } catch (error) {
        console.error('getIssues failed:', error);
        const message =
        error instanceof Error ? error.message : 'Не удалось загрузить задачи';
        return { error: message };        
    }
});

export const handler = resolver.getDefinitions();
