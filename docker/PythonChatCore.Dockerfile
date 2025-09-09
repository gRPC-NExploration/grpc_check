# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем зависимости системы
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry (если используете его для управления зависимостями)
RUN pip install poetry
RUN pip install grpcio_tools
# Устанавливаем переменные окружения
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы описания зависимостей
COPY ../src/back/ChatCore/pyproject.toml ../src/back/ChatCore/poetry.lock ./

# Устанавливаем зависимости (включая dev-зависимости, если нужно)
RUN poetry install --no-root

# Копируем proto-файлы и исходный код
COPY ../Protos/ ./proto/
COPY ../src/back/ChatCore ./

# Генерируем gRPC-коды (пример команды, адаптируйте под свой случай)
RUN python -m grpc_tools.protoc -I./proto \
    --python_out=./chat_core/grpc_generated \
    --grpc_python_out=./chat_core/grpc_generated \
    ./proto/*.proto

# Устанавливаем сам проект
RUN poetry install

# Команда запуска приложения
CMD ["poetry", "run", "python", "-m", "chat_core.main"]