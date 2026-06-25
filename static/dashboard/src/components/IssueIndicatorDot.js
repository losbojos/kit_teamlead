import React from 'react';

/** Размер цветного круга-индикатора */
export const INDICATOR_DOT_SIZE = 12;

function buildDotStyle({ color, size }) {
    const base = {
        display: 'inline-block',
        width: size,
        verticalAlign: 'middle',
        flexShrink: 0,
    };

    if (!color) {
        return base; // заглушка для обычных задач
    }

    return {
        ...base,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
    };
}

/**
 * Цветной круг-индикатор проблемной задачи.
 */
export function IssueIndicatorDot({ color, size = INDICATOR_DOT_SIZE }) {
    return (
        <span style={buildDotStyle({ color, size })} />
    );
}
