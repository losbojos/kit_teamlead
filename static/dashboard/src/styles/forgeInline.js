/**
 * Inline-стили для Forge.
 * MUI sx иногда ломается в Jira, а так надёжнее.
 */

/** Строка легенды со статистикой. */
export const LEGEND_CONTAINER_STYLE = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
    fontSize: '0.875rem',
    color: 'rgba(0, 0, 0, 0.6)',
};

/** Горизонтальная группа: кружок + текст. */
export const INLINE_FLEX_CENTER_STYLE = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
};

/** Отступ справа от ячейки с индикатором до колонки Key. */
export const TABLE_INDICATOR_CELL_STYLE = {
    paddingRight: 8,
};
