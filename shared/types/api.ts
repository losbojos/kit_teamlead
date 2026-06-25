import type { Issue } from './issue';

export interface GetIssuesSuccess {
    issues: Issue[];
}

export interface GetIssuesError {
    error: string;
}

export type GetIssuesResult = GetIssuesSuccess | GetIssuesError;

export function isGetIssuesError(result: GetIssuesResult): result is GetIssuesError {
    return 'error' in result;
}
