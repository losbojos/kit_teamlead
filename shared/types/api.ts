import type { Issue } from './issue';
import type { ProjectMember } from './member';
import type { Project } from './project';

/** Общий формат ошибки от любого resolver. */
export interface ApiError {
    error: string;
}

/** Успешный ответ или ошибка — единый паттерн для всех resolver. */
export type ApiResult<TSuccess> = TSuccess | ApiError;

export function isApiError(value: unknown): value is ApiError {
    return typeof value === 'object' && value !== null && 'error' in value;
}

// --- getIssues ---

export interface GetIssuesSuccess {
    issues: Issue[];
}

export type GetIssuesResult = ApiResult<GetIssuesSuccess>;


// --- getProjects ---

export interface GetProjectsSuccess {
    projects: Project[];
}

export type GetProjectsResult = ApiResult<GetProjectsSuccess>;


// --- getProjectMembers ---

export interface GetProjectMembersSuccess {
    members: ProjectMember[];
}

export type GetProjectMembersResult = ApiResult<GetProjectMembersSuccess>;


// --- assignIssue / updateIssuePriority ---

/** Успешный ответ после изменения задачи (назначение, приоритет и т.д.). */
export interface IssueSuccess {
    issue: Issue;
}

export type IssueResult = ApiResult<IssueSuccess>;

// --- autoAssignUnassigned ---

export interface AutoAssignSuccess {
    assignedCount: number;
    issues: Issue[];
}

export type AutoAssignResult = ApiResult<AutoAssignSuccess>;
