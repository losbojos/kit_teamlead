import React from 'react';
import { IssueIndicatorDot } from './IssueIndicatorDot';
import { ISSUE_PROBLEM_CATEGORIES } from '../utils/issueRules';
import { INLINE_FLEX_CENTER_STYLE, LEGEND_CONTAINER_STYLE } from '../styles/forgeInline';

function LegendItem({ color, label, value }) {
    return (
        <span style={INLINE_FLEX_CENTER_STYLE}>
            <IssueIndicatorDot color={color} />
            <span>{label}: {value}</span>
        </span>
    );
}

/**
 * Строка статистики и легенды над таблицей задач.
 */
function StatsLegend({ total, problemCounts }) {
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
