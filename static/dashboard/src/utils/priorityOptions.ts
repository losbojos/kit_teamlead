import type { Issue } from '../types/issue';

export interface PriorityOption {
    priorityId: string;
    priorityName: string;
}

const MEDIUM_PRIORITY_NAMES = new Set(['medium', 'средний']);
const HIGH_PRIORITY_NAMES = new Set(['high', 'высокий']);

/**
 * Ищет priorityId для Medium и High среди уже загруженных задач.
 * ID приоритетов различаются на разных сайтах Jira — берём из реальных данных проекта.
 */
export function getElevatedPriorityOptions(issues: Issue[]): PriorityOption[] {
    let medium: PriorityOption | null = null;
    let high: PriorityOption | null = null;

    issues.forEach((issue) => {
        if (!issue.priorityId || !issue.priority) {
            return;
        }

        const normalized = issue.priority.trim().toLowerCase();

        if (!medium && MEDIUM_PRIORITY_NAMES.has(normalized)) {
            medium = {
                priorityId: issue.priorityId,
                priorityName: issue.priority,
            };
        }

        if (!high && HIGH_PRIORITY_NAMES.has(normalized)) {
            high = {
                priorityId: issue.priorityId,
                priorityName: issue.priority,
            };
        }
    });

    const options: PriorityOption[] = [];

    if (medium) {
        options.push(medium);
    }

    if (high) {
        options.push(high);
    }

    return options;
}
