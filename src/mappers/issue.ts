import type { Issue } from '../../shared/types/issue';
import type { JiraIssue } from '../types/jira';

/**
 * Преобразует задачу из ответа Jira REST API в компактный объект для UI.
 */
export function mapIssue(issue: JiraIssue): Issue {
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
