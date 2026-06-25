import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { FORGE_MODAL_CONFIRM_BUTTON_STYLE } from '../styles/forgeInline';

interface ModalConfirmButtonProps extends ButtonProps {
    loading?: boolean;
    label: string;
}

/**
 * Кнопка подтверждения в модалке: при loading добавляет «...» к тексту.
 */
function ModalConfirmButton({
    loading = false,
    label,
    disabled,
    style,
    ...props
}: ModalConfirmButtonProps) {
    return (
        <Button
            variant="contained"
            disabled={disabled || loading}
            style={{ ...FORGE_MODAL_CONFIRM_BUTTON_STYLE, ...style }}
            {...props}
        >
            {loading ? `${label}...` : label}
        </Button>
    );
}

export default ModalConfirmButton;
