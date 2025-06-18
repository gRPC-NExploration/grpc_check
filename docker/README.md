# gRPC App — Docker Setup

Этот проект состоит из нескольких компонентов, контейнеризованных с помощью Docker Compose:

- **backend** — ASP.NET Core gRPC сервер
- **react** — фронтенд на Bun + Vite
- **cli** — CLI-клиент для взаимодействия с backend
- *(в будущем будет также Python backend)*

## 🧩 Структура профилей

Docker Compose использует [профили](https://docs.docker.com/compose/profiles/) для управления тем, какие сервисы запускать:

| Профиль  | Что запускается          |
|----------|--------------------------|
| `react`  | `backend` + `react`       |
| `cli`    | `backend` + `cli`         |

## 🚀 Запуск

### Старт фронтенда на порту 4173 (React + backend)

```bash
docker compose --profile react up -d
