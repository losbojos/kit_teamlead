import type { Issue } from '../shared/types/issue';

export type { Issue };

/** Идентификаторы типов проблемных задач — единый источник строковых значений. */
export const ISSUE_PROBLEM = {
    UNASSIGNED: 'unassigned',
    LOW_PRIORITY_DEADLINE: 'low_priority_deadline',
} as const;

export type IssueProblemType = typeof ISSUE_PROBLEM[keyof typeof ISSUE_PROBLEM];

export type IssueProblemCounts = Record<IssueProblemType, number>;

export interface IssueProblemCategory {
    type: IssueProblemType;
    color: string;
    label: string;
    matches: (issue: Issue) => boolean;
}
