import React, { useMemo, useState } from 'react';
import { invoke } from '@forge/bridge';
import {
    Alert,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItemButton,
    ListItemText,
    Typography,
} from '@mui/material';
import ForgeDialog from './ForgeDialog';
import ModalConfirmButton from './ModalConfirmButton';
import type { IssueResult } from '../types/api';
import { isApiError } from '../types/api';
import type { Issue } from '../types/issue';
import { getElevatedPriorityOptions } from '../utils/priorityOptions';
import {
    FORGE_DIALOG_ACTIONS_STYLE,
    FORGE_DIALOG_CONTENT_STYLE,
    FORGE_DIALOG_TITLE_STYLE,
    FORGE_PICKER_LIST_LABEL_STYLE,
    FORGE_PICKER_LIST_STYLE,
    forgePickerListItemStyle,
} from '../styles/forgeInline';

export interface PriorityModalProps {
    open: boolean;
    issue: Issue | null;
    issues: Issue[];
    onClose: () => void;
    onUpdated: (issue: Issue) => void;
}

/**
 * Модалка повышения приоритета для задачи с низким приоритетом и близким дедлайном.
 */
function PriorityModal({ open, issue, issues, onClose, onUpdated }: PriorityModalProps) {
    const priorityOptions = useMemo(() => getElevatedPriorityOptions(issues), [issues]);
    const [selectedPriorityId, setSelectedPriorityId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleClose = () => {
        if (saving) {
            return;
        }
        setSelectedPriorityId(null);
        setSaveError(null);
        onClose();
    };

    const handleConfirm = async () => {
        if (!issue || !selectedPriorityId) {
            return;
        }

        setSaving(true);
        setSaveError(null);

        try {
            const result = (await invoke('updateIssuePriority', {
                issueKey: issue.key,
                priorityId: selectedPriorityId,
            })) as IssueResult;

            if (isApiError(result)) {
                setSaveError(result.error);
                return;
            }

            setSelectedPriorityId(null);
            onUpdated(result.issue);
        } catch (updateError) {
            const message = updateError instanceof Error
                ? updateError.message
                : 'Не удалось изменить приоритет';
            setSaveError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ForgeDialog open={open} onClose={handleClose}>
            <DialogTitle style={FORGE_DIALOG_TITLE_STYLE}>
                Повысить приоритет
            </DialogTitle>
            <DialogContent style={FORGE_DIALOG_CONTENT_STYLE}>
                {issue && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {issue.key}: {issue.summary}
                    </Typography>
                )}

                {priorityOptions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" style={{ marginTop: 8 }}>
                        Нет задач с приоритетом Medium/High в проекте — невозможно определить ID
                    </Typography>
                )}

                {priorityOptions.length > 0 && (
                    <>
                        <Typography component="div" style={FORGE_PICKER_LIST_LABEL_STYLE}>
                            Выберите новый приоритет
                        </Typography>
                        <List dense disablePadding style={FORGE_PICKER_LIST_STYLE}>
                            {priorityOptions.map((option) => {
                                const isSelected = selectedPriorityId === option.priorityId;

                                return (
                                    <ListItemButton
                                        key={option.priorityId}
                                        onClick={() => setSelectedPriorityId(option.priorityId)}
                                        disabled={saving}
                                        style={forgePickerListItemStyle(isSelected)}
                                    >
                                        <ListItemText primary={option.priorityName} />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </>
                )}

                {saveError && (
                    <Alert severity="error" style={{ marginTop: 16 }}>
                        {saveError}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions style={FORGE_DIALOG_ACTIONS_STYLE}>
                <Button onClick={handleClose} disabled={saving}>
                    Отмена
                </Button>
                <ModalConfirmButton
                    label="Применить"
                    loading={saving}
                    onClick={handleConfirm}
                    disabled={!selectedPriorityId || priorityOptions.length === 0}
                />
            </DialogActions>
        </ForgeDialog>
    );
}

export default PriorityModal;
