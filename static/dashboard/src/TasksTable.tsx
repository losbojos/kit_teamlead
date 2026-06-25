import React from 'react';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { IssueIndicatorDot } from './components/IssueIndicatorDot';
import { getIssueIndicatorColor, getIssueProblem } from './utils/issueRules';
import { Issue, IssueProblemType } from './types/issue';
import { TABLE_INDICATOR_CELL_STYLE } from './styles/forgeInline';

export interface TasksTableProps {
    issues: Issue[];
    onFixClick: (issue: Issue, problemType: IssueProblemType) => void;
}

/**
 * Таблица задач проекта (MUI Table)
 */
function TasksTable({ issues, onFixClick }: TasksTableProps) {
    if (issues.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                В проекте нет задач
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell style={TABLE_INDICATOR_CELL_STYLE} />
                        <TableCell>Key</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Due date</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map((issue) => {
                        const problemType = getIssueProblem(issue);

                        return (
                        <TableRow key={issue.key}>
                            <TableCell style={TABLE_INDICATOR_CELL_STYLE}>
                                <IssueIndicatorDot color={getIssueIndicatorColor(issue)} />
                            </TableCell>
                            <TableCell>{issue.key}</TableCell>
                            <TableCell>{issue.summary}</TableCell>
                            <TableCell>{issue.status}</TableCell>
                            <TableCell>{issue.assignee || '—'}</TableCell>
                            <TableCell>{issue.priority || '—'}</TableCell>
                            <TableCell>{issue.dueDate || '—'}</TableCell>
                            <TableCell>
                                {problemType && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => onFixClick(issue, problemType)}
                                    >
                                        Fix
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default TasksTable;
