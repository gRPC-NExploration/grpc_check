FROM python:3.11-alpine
WORKDIR /app

COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/back/ChatCore .
COPY ./Protos/Core ./Protos/Core

RUN python -m grpc_tools.protoc -I./Protos/Core/ \
    --python_out=./chat_core/grpc_generated \
    --grpc_python_out=./chat_core/grpc_generated \
    --pyi_out=./chat_core/grpc_generated \
    ./Protos/Core/chat_service.proto \
    ./Protos/Core/messages/messages.proto

EXPOSE 50051

RUN python ./chat_core/main.py