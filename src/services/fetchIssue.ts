import api, { route } from '@forge/api';
import type { Issue } from '../../shared/types/issue';
import { mapIssue } from '../mappers/issue';
import type { JiraIssue } from '../types/jira';

const ISSUE_FIELDS = 'summary,status,assignee,priority,duedate';

/**
 * Загружает одну задачу по ключу и возвращает UI-модель.
 * Используется после assign / update priority.
 */
export async function fetchIssueByKey(issueKey: string): Promise<Issue> {
    const response = await api.asUser().requestJira(
        route`/rest/api/3/issue/${issueKey}?fields=${ISSUE_FIELDS}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
    );

    if (!response.ok) {
        const details = await response.text();
        console.error('Jira fetch issue failed:', response.status, details);
        throw new Error(`Ошибка Jira API (${response.status})`);
    }

    const data = (await response.json()) as JiraIssue;
    return mapIssue(data);
}
