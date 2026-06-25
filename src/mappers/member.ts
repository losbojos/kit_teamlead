import type { ProjectMember } from '../../shared/types/member';
import type { JiraAssignableUser } from '../types/jira';

/**
 * Преобразует пользователя Jira в компактную модель для UI.
 */
export function mapMember(user: JiraAssignableUser): ProjectMember {
    return {
        accountId: user.accountId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrls?.['48x48'] ?? null,
    };
}
