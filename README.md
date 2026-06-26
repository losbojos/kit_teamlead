# Jira Project Assistant

Forge-приложение для тестового задания Teamlead: показывает проблемные задачи проекта в Jira, позволяет исправлять их вручную и массово, отображает статистику и команду.

**Сайт разработки:** `bojos80.atlassian.net`  
**Окружение Forge:** `development`

---

## Технологии

| Слой | Стек |
|------|------|
| Платформа | Atlassian Forge (Custom UI + resolvers) |
| Backend | TypeScript, `@forge/api`, Jira REST API v3 |
| Frontend | React, Material-UI, TypeScript |
| State | React `useState` / `useMemo` (локальный state) |
| Docker | `Dockerfile` + `docker-compose.yml` (см. раздел Docker) |

---

## Структура проекта

```
kit_teamlead/
├── manifest.yml              # модули Forge (project page + global page)
├── Dockerfile
├── docker-compose.yml
├── package.json
├── src/
│   ├── index.ts              # resolvers (backend)
│   ├── mappers/              # Jira → UI-модели
│   ├── services/             # JQL, auto-assign, fetch issue
│   └── types/jira.ts
├── shared/types/             # общие типы API (backend + UI)
├── scripts/
│   ├── sync-shared.js        # копирует shared/ → static/dashboard
│   └── load-env.ps1
├── static/dashboard/         # React Custom UI
│   └── src/
│       ├── App.tsx
│       ├── components/
│       ├── utils/issueRules.ts
│       └── styles/forgeInline.ts
├── .env.example              # шаблон Forge credentials
└── .env                      # локально, не коммитить
```

---

## Требования

- [Node.js](https://nodejs.org/) 20+
- [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/): `npm install -g @forge/cli`
- Аккаунт Atlassian Cloud с правами на Jira и Forge app
- API token: https://id.atlassian.com/manage-profile/security/api-tokens

---

## Быстрый старт (рекомендуется)

Из корня проекта:

```powershell
cd C:\src\tests\kit_teamlead

# 1. Зависимости
npm install
npm run ui:install

# 2. Учётные данные Forge (скопируй .env.example → .env)
copy .env.example .env
# Заполни FORGE_EMAIL и FORGE_API_TOKEN в .env

npm run env:load
forge login   # если ещё не залогинен

# 3. Проверка типов (опционально)
npm run typecheck

# 4. Сборка UI и деплой
npm run deploy

# 5. Первая установка или обновление на сайте
npm run forge:install    # первый раз
npm run forge:upgrade    # после изменения manifest.yml
```

### Где открыть в Jira

**Основной способ (project page):**

1. Открой проект в Jira
2. Левая панель → **Apps** → **kit_teamlead**

**Global page** (если виден в меню Apps): пункт **kit_teamlead** в разделе приложений Jira.

---

## Функционал

### Dashboard

- Таблица задач: Key, Summary, Status, Assignee, Priority, Due date, Actions
- Индикаторы проблем:
  - 🔴 без исполнителя
  - 🟡 низкий приоритет + дедлайн ≤ 7 дней
- Кнопка **Fix** для проблемных задач
- Статистика и **Auto-assign unassigned** (с подтверждением)
- **Dropdown** выбора проекта (список из Jira API)

### Fix

| Проблема | Действие |
|----------|----------|
| Нет исполнителя | Модалка выбора участника → `assignIssue` |
| Низкий приоритет + дедлайн | Модалка Medium/High → `updateIssuePriority` |

### Team

- Вкладка **Team**: участники, число назначенных и открытых задач, активность (есть открытые назначенные → «Активен»)

### Backend resolvers

| Resolver | Назначение |
|----------|------------|
| `getProjects` | Список проектов для dropdown |
| `getIssues` | Задачи проекта (JQL) |
| `getProjectMembers` | Участники для назначения |
| `assignIssue` | Назначить исполнителя |
| `updateIssuePriority` | Сменить приоритет |
| `autoAssignUnassigned` | Round-robin unassigned → активным участникам |

Типы запросов/ответов: `shared/types/api.ts`.

---

## Полезные команды

```powershell
npm run typecheck          # TypeScript backend + UI
npm run build:ui           # только сборка React
npm run deploy             # build:ui + forge deploy
npm run forge:upgrade      # обновить установку после смены manifest
forge tunnel               # локальная разработка UI (опционально)
```

---

## Docker

В репозитории есть `Dockerfile` и `docker-compose.yml` — единая среда с Node 20 и Forge CLI для `deploy`, `typecheck`, `forge tunnel`.

### Требования для Docker

- Docker Desktop (Windows / macOS) или Docker Engine (Linux)
- На **Windows**: WSL 2 и компоненты **Virtual Machine Platform** / **Windows Subsystem for Linux**

### Запуск (Linux / macOS или Windows с рабочим WSL2)

```powershell
copy .env.example .env
# заполни FORGE_EMAIL и FORGE_API_TOKEN

docker compose build
docker compose run --rm forge-dev forge whoami
docker compose run --rm forge-dev npm run typecheck
docker compose run --rm forge-dev npm run deploy
```

Интерактивная оболочка: `npm run docker:shell`

### Примечание для проверяющего (Windows)

На машине автора локальный Docker Desktop **не запускается**: установка компонентов Windows для WSL2 завершается с ошибкой `0x800f0922` (CBS). Файлы Docker присутствуют в репозитории и предназначены для стандартной среды; разработка и деплой выполняются **напрямую через Node.js + Forge CLI** (раздел «Быстрый старт»).

---

## Особенности Custom UI в Forge

MUI `sx` и Portal в iframe Jira часто ломаются. В проекте:

- модалки через `ForgeDialog` (`disablePortal`, inline-стили)
- dropdown проекта — нативный `<select>`
- стили вкладок и панелей — `static/dashboard/src/styles/forgeInline.ts`

---

## Чеклист ТЗ

- [x] Таблица задач с подсветкой проблемных
- [x] Fix: назначение исполнителя и смена приоритета
- [x] Статистика + Auto-assign с подтверждением
- [x] Dropdown выбора проекта
- [x] Вкладка Team
- [x] TypeScript, React, MUI, Forge, Jira API v3
- [x] Типизация API, loading/error
- [x] Dockerfile + docker-compose.yml
- [x] Документация (этот README)
