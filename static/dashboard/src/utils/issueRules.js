/**
 * Названия низких приоритетов в Jira (EN и RU).
 */
const LOW_PRIORITY_NAMES = new Set([
    'low',
    'lowest',
    'низкий',
    'низший',
    'наинизший',
    'самый низкий',
]);

/** Сколько дней до дедлайна считаем «близким» (включительно). */
const DEADLINE_DAYS_THRESHOLD = 7;

/**
 * Задача без исполнителя.
 */
export function isUnassigned(issue) {
    return !issue.assigneeAccountId;
}

/**
 * Низкий приоритет
 */
export function isLowPriority(priorityName) {
    if (!priorityName) {
        return false;
    }

    return LOW_PRIORITY_NAMES.has(priorityName.trim().toLowerCase());
}

/**
 * Дней до дедлайна (отрицательное — просрочен).
 */
export function daysUntilDue(dueDate) {
    if (!dueDate) {
        return null;
    }

    const due = new Date(`${dueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = due.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Низкий приоритет и дедлайн в ближайшее время (или просрочен).
 */
export function isLowPriorityNearDeadline(issue) {
    if (!issue.dueDate) {
        return false;
    }

    if (!isLowPriority(issue.priority)) {
        return false;
    }

    const daysLeft = daysUntilDue(issue.dueDate);
    return daysLeft !== null && daysLeft <= DEADLINE_DAYS_THRESHOLD;
}

/**
 * Категории проблемных задач.
 * Порядок в массиве = порядок в легенде и приоритет проверки (первое совпадение).
 *
 * @type {Array<{ type: string, color: string, label: string, matches: (issue: object) => boolean }>}
 */
export const ISSUE_PROBLEM_CATEGORIES = [
    {
        type: 'unassigned',
        color: '#e53935',
        label: 'Без исполнителя',
        matches: isUnassigned,
    },
    {
        type: 'low_priority_deadline',
        color: '#f9a825',
        label: 'С риском дедлайна',
        matches: isLowPriorityNearDeadline,
    },
];

/** Быстрый поиск категории по type. */
const CATEGORY_BY_TYPE = Object.fromEntries(
    ISSUE_PROBLEM_CATEGORIES.map((category) => [category.type, category])
);

/**
 * Пустая мапа счётчиков (все ключи — 0).
 */
export function createEmptyIssueProblemCounts() {
    return ISSUE_PROBLEM_CATEGORIES.reduce((counts, { type }) => {
        counts[type] = 0;
        return counts;
    }, {});
}

/**
 * Возвращает тип проблемы или null, если задача не проблемная.
 */
export function getIssueProblem(issue) {
    const category = ISSUE_PROBLEM_CATEGORIES.find(({ matches }) => matches(issue));
    return category ? category.type : null;
}

/**
 * true, если к задаче применимо хотя бы одно правило из ТЗ.
 */
export function isProblematicIssue(issue) {
    return getIssueProblem(issue) !== null;
}

/**
 * Считает проблемные задачи: мапа { тип проблемы → количество }.
 */
export function countIssueProblems(issues) {
    const counts = createEmptyIssueProblemCounts();

    issues.forEach((issue) => {
        const problem = getIssueProblem(issue);

        if (problem) {
            counts[problem] += 1;
        }
    });

    return counts;
}

/**
 * Цвет индикатора-круга (🔴 / 🟡) или null для обычных задач.
 */
export function getIssueIndicatorColor(issue) {
    const problem = getIssueProblem(issue);
    return problem ? CATEGORY_BY_TYPE[problem].color : null;
}
