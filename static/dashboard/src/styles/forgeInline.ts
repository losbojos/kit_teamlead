import { CSSProperties } from 'react';

/**
 * Inline-стили для Forge.
 * MUI sx иногда ломается в Jira, а так надёжнее.
 */

/** Строка легенды со статистикой. */
export const LEGEND_CONTAINER_STYLE: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
    fontSize: '0.875rem',
    color: 'rgba(0, 0, 0, 0.6)',
};

/** Горизонтальная группа: кружок + текст. */
export const INLINE_FLEX_CENTER_STYLE: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
};

/** Отступ справа от ячейки с индикатором до колонки Key. */
export const TABLE_INDICATOR_CELL_STYLE: CSSProperties = {
    paddingRight: 6,
};

/** Затемнение фона модалки — inline, т.к. MUI Modal в Forge iframe ломается. */
export const FORGE_DIALOG_BACKDROP_STYLE: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1300,
};

/** Панель модалки по центру экрана поверх контента. */
export const FORGE_DIALOG_PAPER_STYLE: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1301,
    margin: 0,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85vh',
    overflow: 'auto',
    backgroundColor: '#fff',
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
};

/** Кнопки внизу модалки с отступом между ними. */
export const FORGE_DIALOG_ACTIONS_STYLE: CSSProperties = {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    padding: '12px 24px 20px',
};

export const FORGE_DIALOG_TITLE_STYLE: CSSProperties = {
    padding: '20px 24px 8px',
};

export const FORGE_DIALOG_CONTENT_STYLE: CSSProperties = {
    padding: '8px 24px 16px',
};

/** Контейнер списка выбора в модалке — видно, что это кликабельные пункты. */
export const FORGE_PICKER_LIST_STYLE: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
    padding: 12,
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fafafa',
};

export const FORGE_PICKER_LIST_LABEL_STYLE: CSSProperties = {
    marginTop: 12,
    marginBottom: 4,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'rgba(0, 0, 0, 0.7)',
};

/** Пункт списка выбора — базовая «карточка», selected усиливает подсветку. */
export function forgePickerListItemStyle(isSelected: boolean): CSSProperties {
    return {
        border: isSelected ? '1px solid #1976d2' : '1px solid #e0e0e0',
        borderRadius: 4,
        padding: '10px 12px',
        backgroundColor: isSelected ? '#e3f2fd' : '#ffffff',
        borderLeft: isSelected ? '3px solid #1976d2' : '3px solid #bdbdbd',
        boxSizing: 'border-box',
    };
}

/** Кнопка подтверждения: фиксированная ширина, текст не прыгает */
export const FORGE_MODAL_CONFIRM_BUTTON_STYLE: CSSProperties = {
    minWidth: 128,
};
