/**
 * Участник проекта, которого можно назначить исполнителем задачи.
 */
export interface ProjectMember {
    accountId: string;
    displayName: string;
    avatarUrl: string | null;
}
