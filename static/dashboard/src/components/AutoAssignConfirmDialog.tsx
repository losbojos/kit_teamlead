import React from 'react';
import {
    Alert,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import ForgeDialog from './ForgeDialog';
import ModalConfirmButton from './ModalConfirmButton';
import {
    FORGE_DIALOG_ACTIONS_STYLE,
    FORGE_DIALOG_CONTENT_STYLE,
    FORGE_DIALOG_TITLE_STYLE,
} from '../styles/forgeInline';

export interface AutoAssignConfirmDialogProps {
    open: boolean;
    count: number;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * Подтверждение массового назначения задач.
 */
function AutoAssignConfirmDialog({
    open,
    count,
    loading,
    error,
    onClose,
    onConfirm,
}: AutoAssignConfirmDialogProps) {
    return (
        <ForgeDialog
            open={open}
            onClose={loading ? undefined : onClose}
        >
            <DialogTitle style={FORGE_DIALOG_TITLE_STYLE}>
                Auto-assign unassigned
            </DialogTitle>
            <DialogContent style={FORGE_DIALOG_CONTENT_STYLE}>
                <Typography>
                    Назначить {count} {count === 1 ? 'задачу' : 'задач'} активным участникам?
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions style={FORGE_DIALOG_ACTIONS_STYLE}>
                <Button onClick={onClose} disabled={loading}>
                    Отмена
                </Button>
                <ModalConfirmButton
                    label="Назначить"
                    loading={loading}
                    onClick={onConfirm}
                />
            </DialogActions>
        </ForgeDialog>
    );
}

export default AutoAssignConfirmDialog;
