import React from 'react';
import { IssueIndicatorDot } from './IssueIndicatorDot';
import { ISSUE_PROBLEM_CATEGORIES } from '../utils/issueRules';
import { IssueProblemCounts } from '../types/issue';
import { INLINE_FLEX_CENTER_STYLE, LEGEND_CONTAINER_STYLE } from '../styles/forgeInline';

interface LegendItemProps {
    color: string;
    label: string;
    value: number;
}

function LegendItem({ color, label, value }: LegendItemProps) {
    return (
        <span style={INLINE_FLEX_CENTER_STYLE}>
            <IssueIndicatorDot color={color} />
            <span>{label}: {value}</span>
        </span>
    );
}

export interface StatsLegendProps {
    total: number;
    problemCounts: IssueProblemCounts;
}

/**
 * Строка статистики и легенды над таблицей задач.
 */
function StatsLegend({ total, problemCounts }: StatsLegendProps) {
    return (
        <div style={LEGEND_CONTAINER_STYLE}>
            <span>Задач: {total}</span>
            {ISSUE_PROBLEM_CATEGORIES.map(({ type, color, label }) => (
                <LegendItem
                    key={type}
                    color={color}
                    label={label}
                    value={problemCounts[type]}
                />
            ))}
        </div>
    );
}

export default StatsLegend;
