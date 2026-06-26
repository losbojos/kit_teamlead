import type { Project } from '../../shared/types/project';
import type { JiraProject } from '../types/jira';

/**
 * Маппинг проекта Jira в UI-модель.
 */
export function mapProject(project: JiraProject): Project {
    return {
        id: project.id,
        key: project.key,
        name: project.name,
    };
}
