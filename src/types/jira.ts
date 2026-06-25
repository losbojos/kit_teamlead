/**
 * Типы ответа Jira REST API v3 — только для бэкенда.
 */

export interface JiraIssueFields {
    summary?: string;
    status?: { name?: string };
    assignee?: { displayName?: string; accountId?: string } | null;
    priority?: { name?: string; id?: string } | null;
    duedate?: string | null;
}

export interface JiraIssue {
    key: string;
    fields?: JiraIssueFields;
}

export interface JiraSearchJqlResponse {
    issues?: JiraIssue[];
}
