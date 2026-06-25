/**
 * Компактное представление задачи Jira
 */
export interface Issue {
    key: string;
    summary: string;
    status: string;
    assignee: string | null;
    assigneeAccountId: string | null;
    priority: string | null;
    priorityId: string | null;
    dueDate: string | null;
}
