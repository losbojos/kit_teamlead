import React from 'react';
import type { Project } from '../shared/types/project';
import {
    FORGE_PROJECT_SELECT_LABEL_STYLE,
    FORGE_PROJECT_SELECT_STYLE,
    FORGE_PROJECT_SELECT_WRAPPER_STYLE,
} from '../styles/forgeInline';

export interface ProjectSelectProps {
    projects: Project[];
    projectKey: string | null;
    disabled?: boolean;
    onProjectChange: (projectKey: string) => void;
}

/**
 * Dropdown выбора проекта.
 * Нативный <select> — MUI Select в Forge iframe рисует сломанную иконку.
 */
function ProjectSelect({
    projects,
    projectKey,
    disabled = false,
    onProjectChange,
}: ProjectSelectProps) {
    return (
        <div style={FORGE_PROJECT_SELECT_WRAPPER_STYLE}>
            <label htmlFor="project-select" style={FORGE_PROJECT_SELECT_LABEL_STYLE}>
                Проект
            </label>
            <select
                id="project-select"
                value={projectKey ?? ''}
                disabled={disabled}
                onChange={(event) => onProjectChange(event.target.value)}
                style={FORGE_PROJECT_SELECT_STYLE}
            >
                {projects.map((project) => (
                    <option key={project.key} value={project.key}>
                        {project.name} ({project.key})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ProjectSelect;
