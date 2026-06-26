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

/** Пользователь из GET /rest/api/3/user/assignable/search */
export interface JiraAssignableUser {
    accountId: string;
    displayName: string;
    avatarUrls?: {
        '48x48'?: string;
    };
}

/** Проект из GET /rest/api/3/project/search */
export interface JiraProject {
    id: string;
    key: string;
    name: string;
}

export interface JiraProjectSearchResponse {
    values?: JiraProject[];
}
