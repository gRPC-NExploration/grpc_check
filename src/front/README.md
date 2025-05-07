# Запуск проекта

Ниже описаны основные команды и требования для запуска приложения на **React +
Vite + [protobuf-ts (gRPC-web)](https://github.com/timostamm/protobuf-ts)**.

## 🛠 Генерация кода gRPC-клиента (для разработки)

Внутри папки `src/front` обязательно должна быть директория `/proto`:

```
src/front/
├── proto/
├── src/
├── package.json
└── vite.config.ts
```

Все `.proto` файлы лежат в корне репозитория в папке `Protos/`.

> ⚠️ Для запуска команд на основе `bun` необходимо, чтобы **Bun** был установлен в системе. В качестве альтернативы
> можно использовать `npm`. Для генератора нужно заменить `bunx` на `npx` в соответствующих скриптах `package.json`.

Команды для генерации:

1. `cd src/front`
2. `bun install`
3. `bunx run generate:local`

## 🚀 Запуск в режиме разработки

В директории `src/front`:

1. `bun install`
2. `bun run dev`

Сервер будет доступен по адресу `http://localhost:5173`.

## 🐳 Docker

### Сборка образа

```
docker build --build-arg VITE_GRPC_URL=http://your-api-url:8080 -t grpc-chat-files-client .
```

- `--build-arg VITE_GRPC_URL=http://your-api-url:8080`: Передает URL вашего API в качестве переменной окружения для
  сборки. По умолчанию используется `http://localhost:8080`
- `-t grpc-chat-files-client`: Задает тег для вашего образа, чтобы вы могли легко ссылаться на него позже.

### Запуск контейнера

```
docker run -p 4173:4173 --name grpc-chat-files-client-container grpc-chat-files-client
```

- `-p 4173:4173`: Маппирует порт 4173 контейнера на порт 4173 хоста, чтобы вы могли получить доступ к приложению через
  браузер.
- `--name grpc-chat-files-client-container`: Задает имя для вашего контейнера, чтобы вы могли легко управлять им.
- `grpc-chat-files-client`: Имя образа, который вы создали на предыдущем шаге.
