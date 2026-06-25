# Jira Project Assistant

Forge-приложение для тестового задания Teamlead.

## Структура

```
kit_teamlead/
├── manifest.yml
├── package.json
├── src/index.js           # backend resolver
├── static/dashboard/      # Custom UI
├── .env                   # Forge credentials (не коммитить)
├── scripts/
├── doc/                   # ТЗ
└── .local/                # план, заметки
```

## Быстрый старт

Из корня проекта:

```powershell
cd C:\src\tests\kit_teamlead

npm run env:load
npm run ui:install
npm run build:ui
npm run forge:deploy
npm run forge:install
```
