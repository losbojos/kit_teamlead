import type { Issue } from '../types/issue';
import type { ProjectMember } from '../shared/types/member';

/**
 * Статусы, с которыми считаем закрытыми задачи (EN и RU).
 */
const CLOSED_STATUS_NAMES = new Set([
    'done',
    'closed',
    'resolved',
    'cancelled',
    'canceled',
    'complete',
    'completed',
    'готово',
    'закрыто',
    'решено',
    'отменено',
    'отменён',
    'отменена',
    'выполнено',
]);

export interface TeamMemberStats {
    accountId: string;
    displayName: string;
    avatarUrl: string | null;
    /** Всего назначенных задач (из загруженного списка). */
    assignedCount: number;
    /** Открытых назначенных задач. */
    openAssignedCount: number;
    /** Есть хотя бы одна открытая назначенная задача. */
    isActive: boolean;
}

/**
 * true, если задача не в финальном статусе.
 */
export function isOpenIssue(issue: Issue): boolean {
    const normalized = issue.status.trim().toLowerCase();
    return !CLOSED_STATUS_NAMES.has(normalized);
}

/**
 * Собирает статистику по участникам
 */
export function buildTeamMemberStats(
    members: ProjectMember[],
    issues: Issue[],
): TeamMemberStats[] {
    return members.map((member) => {
        const assignedIssues = issues.filter(
            (issue) => issue.assigneeAccountId === member.accountId,
        );
        const openAssignedIssues = assignedIssues.filter(isOpenIssue);

        return {
            accountId: member.accountId,
            displayName: member.displayName,
            avatarUrl: member.avatarUrl,
            assignedCount: assignedIssues.length,
            openAssignedCount: openAssignedIssues.length,
            isActive: openAssignedIssues.length > 0,
        };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName, 'ru'));
}
