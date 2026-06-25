import api, { route } from '@forge/api';
import type { JiraIssue, JiraSearchJqlResponse } from '../types/jira';

/**
 * Выполняет JQL-поиск и возвращает сырые задачи Jira.
 */
export async function searchIssuesByJql(jql: string, fields: string[]): Promise<JiraIssue[]> {
    const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jql, fields }),
    });

    if (!response.ok) {
        const details = await response.text();
        console.error('Jira search failed:', response.status, details);
        throw new Error(`Ошибка Jira API (${response.status})`);
    }

    const data = (await response.json()) as JiraSearchJqlResponse;
    return data.issues || [];
}
