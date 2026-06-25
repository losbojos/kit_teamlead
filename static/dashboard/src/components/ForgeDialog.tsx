import React from 'react';
import { Dialog, DialogProps } from '@mui/material';
import { FORGE_DIALOG_BACKDROP_STYLE, FORGE_DIALOG_PAPER_STYLE } from '../styles/forgeInline';

/**
 * Dialog для Custom UI с инлайн-стилями.
 * Обычный MUI Dialog в Jira рисуется в потоке страницы под таблицей.
 */
function ForgeDialog({ children, PaperProps, slotProps, ...props }: DialogProps) {
    const backdropSlot = slotProps?.backdrop;
    const backdropSlotObject = typeof backdropSlot === 'object' ? backdropSlot : {};

    return (
        <Dialog
            disablePortal
            disableScrollLock
            maxWidth="xs"
            fullWidth
            {...props}
            slotProps={{
                ...slotProps,
                backdrop: {
                    ...backdropSlotObject,
                    style: {
                        ...FORGE_DIALOG_BACKDROP_STYLE,
                        ...backdropSlotObject.style,
                    },
                },
            }}
            PaperProps={{
                ...PaperProps,
                style: {
                    ...FORGE_DIALOG_PAPER_STYLE,
                    ...PaperProps?.style,
                },
            }}
        >
            {children}
        </Dialog>
    );
}

export default ForgeDialog;
