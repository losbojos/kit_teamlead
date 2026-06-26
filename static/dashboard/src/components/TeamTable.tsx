import React from 'react';
import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import type { TeamMemberStats } from '../utils/teamStats';

export interface TeamTableProps {
    members: TeamMemberStats[];
    loading: boolean;
    error: string | null;
}

const AVATAR_STYLE: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover',
    verticalAlign: 'middle',
    marginRight: 8,
};

const NAME_CELL_STYLE: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
};

/**
 * Таблица участников проекта: имя, задачи, активность.
 */
function TeamTable({ members, loading, error }: TeamTableProps) {
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <CircularProgress size={22} />
                <Typography variant="body2">Загрузка участников...</Typography>
            </div>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body2">
                Ошибка: {error}
            </Typography>
        );
    }

    if (members.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                В проекте нет доступных участников
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Участник</TableCell>
                        <TableCell>Назначено задач</TableCell>
                        <TableCell>Открытых</TableCell>
                        <TableCell>Активность</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.accountId}>
                            <TableCell>
                                <div style={NAME_CELL_STYLE}>
                                    {member.avatarUrl && (
                                        <img
                                            src={member.avatarUrl}
                                            alt=""
                                            style={AVATAR_STYLE}
                                        />
                                    )}
                                    <span>{member.displayName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{member.assignedCount}</TableCell>
                            <TableCell>{member.openAssignedCount}</TableCell>
                            <TableCell>
                                {member.isActive ? 'Активен' : 'Неактивен'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TeamTable;
