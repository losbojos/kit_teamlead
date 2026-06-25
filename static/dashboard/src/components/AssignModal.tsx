import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import {
    Alert,
    Button,
    CircularProgress,
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
import type { GetProjectMembersResult, IssueResult } from '../types/api';
import { isApiError } from '../types/api';
import type { Issue } from '../types/issue';
import type { ProjectMember } from '../shared/types/member';
import {
    FORGE_DIALOG_ACTIONS_STYLE,
    FORGE_DIALOG_CONTENT_STYLE,
    FORGE_DIALOG_TITLE_STYLE,
    FORGE_PICKER_LIST_LABEL_STYLE,
    FORGE_PICKER_LIST_STYLE,
    forgePickerListItemStyle,
} from '../styles/forgeInline';

export interface AssignModalProps {
    open: boolean;
    issue: Issue | null;
    projectKey: string;
    onClose: () => void;
    onAssigned: (issue: Issue) => void;
}

/**
 * Модалка выбора исполнителя для задачи без исполнителя
 */
function AssignModal({ open, issue, projectKey, onClose, onAssigned }: AssignModalProps) {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !projectKey) {
            return;
        }

        let cancelled = false;

        async function loadMembers() {
            setMembersLoading(true);
            setMembersError(null);
            setMembers([]);
            setSelectedAccountId(null);
            setSaveError(null);

            try {
                const result = (await invoke('getProjectMembers', { projectKey })) as GetProjectMembersResult;

                if (cancelled) {
                    return;
                }

                if (isApiError(result)) {
                    setMembersError(result.error);
                    return;
                }

                setMembers(result.members);
            } catch (loadError) {
                if (!cancelled) {
                    const message = loadError instanceof Error
                        ? loadError.message
                        : 'Не удалось загрузить участников';
                    setMembersError(message);
                }
            } finally {
                if (!cancelled) {
                    setMembersLoading(false);
                }
            }
        }

        loadMembers();

        return () => {
            cancelled = true;
        };
    }, [open, projectKey]);

    const handleConfirm = async () => {
        if (!issue || !selectedAccountId) {
            return;
        }

        setSaving(true);
        setSaveError(null);

        try {
            const result = (await invoke('assignIssue', {
                issueKey: issue.key,
                accountId: selectedAccountId,
            })) as IssueResult;

            if (isApiError(result)) {
                setSaveError(result.error);
                return;
            }

            onAssigned(result.issue);
        } catch (assignError) {
            const message = assignError instanceof Error
                ? assignError.message
                : 'Не удалось назначить исполнителя';
            setSaveError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ForgeDialog open={open} onClose={saving ? undefined : onClose}>
            <DialogTitle style={FORGE_DIALOG_TITLE_STYLE}>
                Назначить исполнителя
            </DialogTitle>
            <DialogContent style={FORGE_DIALOG_CONTENT_STYLE}>
                {issue && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {issue.key}: {issue.summary}
                    </Typography>
                )}

                {membersLoading && (
                    <CircularProgress
                        size={24}
                        style={{ display: 'block', margin: '16px auto' }}
                    />
                )}

                {membersError && (
                    <Alert severity="error" style={{ marginTop: 8 }}>
                        {membersError}
                    </Alert>
                )}

                {!membersLoading && !membersError && members.length === 0 && (
                    <Typography variant="body2" color="text.secondary" style={{ marginTop: 8 }}>
                        Нет доступных участников для назначения
                    </Typography>
                )}

                {!membersLoading && members.length > 0 && (
                    <>
                        <Typography component="div" style={FORGE_PICKER_LIST_LABEL_STYLE}>
                            Выберите исполнителя
                        </Typography>
                        <List dense disablePadding style={FORGE_PICKER_LIST_STYLE}>
                            {members.map((member) => {
                                const isSelected = selectedAccountId === member.accountId;

                                return (
                                    <ListItemButton
                                        key={member.accountId}
                                        onClick={() => setSelectedAccountId(member.accountId)}
                                        disabled={saving}
                                        style={forgePickerListItemStyle(isSelected)}
                                    >
                                        <ListItemText primary={member.displayName} />
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
                <Button onClick={onClose} disabled={saving}>
                    Отмена
                </Button>
                <ModalConfirmButton
                    label="Назначить"
                    loading={saving}
                    onClick={handleConfirm}
                    disabled={!selectedAccountId || membersLoading || Boolean(membersError)}
                />
            </DialogActions>
        </ForgeDialog>
    );
}

export default AssignModal;
