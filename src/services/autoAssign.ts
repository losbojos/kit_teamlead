import api, { route } from '@forge/api';
import type { Issue } from '../../shared/types/issue';
import type { ProjectMember } from '../../shared/types/member';
import { mapMember } from '../mappers/member';
import { fetchIssueByKey } from './fetchIssue';
import { searchIssuesByJql } from './jiraSearch';
import type { JiraAssignableUser } from '../types/jira';

const ISSUE_FIELDS = ['summary', 'status', 'assignee', 'priority', 'duedate'];

async function fetchAssignableMembers(projectKey: string): Promise<ProjectMember[]> {
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
        throw new Error(`Ошибка Jira API (${response.status})`);
    }

    const users = (await response.json()) as JiraAssignableUser[];
    return (users || []).map(mapMember);
}

async function putIssueAssignee(issueKey: string, accountId: string): Promise<void> {
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
        throw new Error(`Ошибка Jira API (${response.status})`);
    }
}

export async function autoAssignUnassignedIssues(
    projectKey: string,
): Promise<{ assignedCount: number; issues: Issue[] }> {
    const unassignedIssues = await searchIssuesByJql(
        `project = "${projectKey}" AND assignee is EMPTY ORDER BY created ASC`,
        ISSUE_FIELDS,
    );

    if (unassignedIssues.length === 0) {
        return { assignedCount: 0, issues: [] };
    }

    const openAssignedIssues = await searchIssuesByJql(
        `project = "${projectKey}" AND assignee is not EMPTY AND resolution = Unresolved`,
        ['assignee'],
    );

    const activeAccountIds = new Set<string>();
    openAssignedIssues.forEach((issue) => {
        const accountId = issue.fields?.assignee?.accountId;
        if (accountId) {
            activeAccountIds.add(accountId);
        }
    });

    const members = await fetchAssignableMembers(projectKey);
    const activeMembers = members.filter((member) => activeAccountIds.has(member.accountId));

    if (activeMembers.length === 0) {
        throw new Error('Нет активных участников для распределения задач');
    }

    const updatedIssues: Issue[] = [];

    for (let index = 0; index < unassignedIssues.length; index += 1) {
        const issueKey = unassignedIssues[index].key;
        const member = activeMembers[index % activeMembers.length];

        await putIssueAssignee(issueKey, member.accountId);
        updatedIssues.push(await fetchIssueByKey(issueKey));
    }

    return {
        assignedCount: updatedIssues.length,
        issues: updatedIssues,
    };
}
