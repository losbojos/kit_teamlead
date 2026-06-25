import React from 'react';
import { Button } from '@mui/material';
import StatsLegend, { StatsLegendProps } from './StatsLegend';

export interface ControlPanelProps extends StatsLegendProps {
    unassignedCount: number;
    onAutoAssignClick: () => void;
}

const PANEL_STYLE: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
};

/**
 * Панель управления: статистика + кнопка auto-assign.
 */
function ControlPanel({
    total,
    problemCounts,
    unassignedCount,
    onAutoAssignClick,
}: ControlPanelProps) {
    return (
        <div style={PANEL_STYLE}>
            <StatsLegend
                total={total}
                problemCounts={problemCounts}
                style={{ marginBottom: 0 }}
            />
            <Button
                variant="outlined"
                disabled={unassignedCount === 0}
                onClick={onAutoAssignClick}
            >
                Назначить unassigned ({unassignedCount})
            </Button>
        </div>
    );
}

export default ControlPanel;
