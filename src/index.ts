import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';
import type {
    ApiError,
    AutoAssignSuccess,
    GetIssuesSuccess,
    GetProjectMembersSuccess,
    IssueSuccess,
} from '../shared/types/api';
import { autoAssignUnassignedIssues } from './services/autoAssign';
import { mapIssue } from './mappers/issue';
import { mapMember } from './mappers/member';
import { fetchIssueByKey } from './services/fetchIssue';
import { searchIssuesByJql } from './services/jiraSearch';
import type { JiraAssignableUser } from './types/jira';

const resolver = new Resolver();

interface ProjectKeyPayload {
    projectKey?: string;
}

interface AssignIssuePayload {
    issueKey?: string;
    accountId?: string;
}

interface UpdateIssuePriorityPayload {
    issueKey?: string;
    priorityId?: string;
}

/**
 * Загружает задачи проекта через Jira REST API v3.
 * Вызывается из Custom UI: invoke('getIssues', { projectKey }).
 */
resolver.define('getIssues', async (req): Promise<GetIssuesSuccess | ApiError> => {
    const { projectKey } = (req.payload || {}) as ProjectKeyPayload;

    if (!projectKey) {
        return { error: 'Не указан projectKey' };
    }

    try {
        const jql = `project = "${projectKey}" ORDER BY created DESC`;
        const issues = await searchIssuesByJql(jql, ['summary', 'status', 'assignee', 'priority', 'duedate']);

        return {
            issues: issues.map(mapIssue),
        };
    } catch (error) {
        console.error('getIssues failed:', error);
        const message =
            error instanceof Error ? error.message : 'Не удалось загрузить задачи';
        return { error: message };
    }
});

/**
 * Загружает участников проекта, которых можно назначить исполнителем.
 * Вызывается из Custom UI: invoke('getProjectMembers', { projectKey }).
 */
resolver.define(
    'getProjectMembers',
    async (req): Promise<GetProjectMembersSuccess | ApiError> => {
        const { projectKey } = (req.payload || {}) as ProjectKeyPayload;

        if (!projectKey) {
            return { error: 'Не указан projectKey' };
        }

        try {
            const response = await api.asUser().requestJira(
                route`/rest/api/3/user/assignable/search?project=${projectKey}`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                },
            );

            if (!response.ok) {
                const details = await response.text();
                console.error('Jira assignable users failed:', response.status, details);
                return { error: `Ошибка Jira API (${response.status})` };
            }

            const users = (await response.json()) as JiraAssignableUser[];

            return {
                members: (users || []).map(mapMember),
            };
        } catch (error) {
            console.error('getProjectMembers failed:', error);
            const message =
                error instanceof Error ? error.message : 'Не удалось загрузить участников';
            return { error: message };
        }
    },
);

/**
 * Назначает исполнителя задаче.
 * Вызывается из Custom UI: invoke('assignIssue', { issueKey, accountId }).
 */
resolver.define('assignIssue', async (req): Promise<IssueSuccess | ApiError> => {
    const { issueKey, accountId } = (req.payload || {}) as AssignIssuePayload;

    if (!issueKey) {
        return { error: 'Не указан issueKey' };
    }

    if (!accountId) {
        return { error: 'Не указан accountId' };
    }

    try {
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/assignee`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accountId }),
        });

        if (!response.ok) {
            const details = await response.text();
            console.error('Jira assign failed:', response.status, details);
            return { error: `Ошибка Jira API (${response.status})` };
        }

        const issue = await fetchIssueByKey(issueKey);
        return { issue };
    } catch (error) {
        console.error('assignIssue failed:', error);
        const message =
            error instanceof Error ? error.message : 'Не удалось назначить исполнителя';
        return { error: message };
    }
});

/**
 * Повышает приоритет задачи.
 * Вызывается из Custom UI: invoke('updateIssuePriority', { issueKey, priorityId }).
 */
resolver.define('updateIssuePriority', async (req): Promise<IssueSuccess | ApiError> => {
    const { issueKey, priorityId } = (req.payload || {}) as UpdateIssuePriorityPayload;

    if (!issueKey) {
        return { error: 'Не указан issueKey' };
    }

    if (!priorityId) {
        return { error: 'Не указан priorityId' };
    }

    try {
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    priority: { id: priorityId },
                },
            }),
        });

        if (!response.ok) {
            const details = await response.text();
            console.error('Jira update priority failed:', response.status, details);
            return { error: `Ошибка Jira API (${response.status})` };
        }

        const issue = await fetchIssueByKey(issueKey);
        return { issue };
    } catch (error) {
        console.error('updateIssuePriority failed:', error);
        const message =
            error instanceof Error ? error.message : 'Не удалось изменить приоритет';
        return { error: message };
    }
});

/**
 * Массово назначает свободные задачи активным участникам.
 */
resolver.define('autoAssignUnassigned', async (req): Promise<AutoAssignSuccess | ApiError> => {
    const { projectKey } = (req.payload || {}) as ProjectKeyPayload;

    if (!projectKey) {
        return { error: 'Не указан projectKey' };
    }

    try {
        return await autoAssignUnassignedIssues(projectKey);
    } catch (error) {
        console.error('autoAssignUnassigned failed:', error);
        const message =
            error instanceof Error ? error.message : 'Не удалось выполнить auto-assign';
        return { error: message };
    }
});

export const handler = resolver.getDefinitions();
