import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

/**
 * Таблица задач проекта
 */
function TasksTable({ issues }) {
    if (issues.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                В проекте нет задач
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map((issue) => (
                        <TableRow key={issue.key}>
                            <TableCell>{issue.key}</TableCell>
                            <TableCell>{issue.summary}</TableCell>
                            <TableCell>{issue.status}</TableCell>
                            <TableCell>{issue.assignee || '—'}</TableCell>
                            <TableCell>{issue.priority || '—'}</TableCell>
                            <TableCell />
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TasksTable;
