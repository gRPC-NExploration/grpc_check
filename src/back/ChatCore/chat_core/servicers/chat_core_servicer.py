from grpc_generated.ChatCore.chat_service_pb2_grpc import ChatServiceServicer
from grpc_generated.ChatCore.chat_service_pb2 import ChatServiceEvent, InitMessage
from grpc_generated.ChatCore.chat_service_pb2 import Message as MessageProto
from infrastracture.repository import ChatInMemoryRepository
from servicers.serializers import get_deserialized_message, get_serialized_chat_event
from servicers.exceptions import ChatIsNotInitialized
from auth import get_user_from_context, User

import logging
import asyncio
from collections import defaultdict


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
memory_repository = ChatInMemoryRepository()


class ChatServiceAsyncio(ChatServiceServicer):
    def __init__(self):
        self.connections = defaultdict(set)
        self.lock = asyncio.Lock()
        self.message_queue = asyncio.Queue()
        self._broadcast_task = asyncio.create_task(self._broadcast_worker())

    async def _broadcast_worker(self):
        """Асинхронная фоновая задача для рассылки сообщений."""
        while True:
            try:
                message = await self.message_queue.get()
                if message is None:
                    break

                chat_name = message.chat_name

                async with self.lock:
                    dead_connections = []
                    for connection in self.connections[chat_name]:
                        try:
                            await connection.put(message)
                        except Exception as e:
                            logger.error(f"Ошибка при отправке сообщения: {e}")
                            dead_connections.append(connection)

                    # Удаляем нерабочие соединения
                    for connection in dead_connections:
                        self.connections.remove(connection)

            except asyncio.CancelledError:
                logger.info("Отправка сообщений отменена")
                break
            except Exception as e:
                logger.error(f"Ошибка в broadcast_worker: {e}")
                await asyncio.sleep(1)

    @staticmethod
    async def _prepare_init_message(chat_info: InitMessage, username: str) -> ChatServiceEvent:
        """Подготовка ответа с уже существующими в чате сообщениями."""
        chat_name = chat_info.chat_name
        memory_repository.create_chat(chat_name=chat_name, creator=username)
        messages_from_repository = memory_repository.get_messages_by_chat_name(chat_name=chat_name)

        return get_serialized_chat_event(
            chat_name=chat_name,
            messages_from_repository=messages_from_repository
        )

    @staticmethod
    async def _handle_message(message: MessageProto) -> None:
        message = get_deserialized_message(message=message)
        memory_repository.save_message(chat_name=message.chat_name, message=message)

    async def _receive_messages(self, request_iterator, connection_queue, chat_name: str):
        """Асинхронный обработчик входящих сообщений."""
        try:
            async for message in request_iterator:
                logger.info("Сохраняем сообщение в репозиторий")
                await self._handle_message(message=message.message)
                await self.message_queue.put(
                    ChatServiceEvent(
                        chat_name=chat_name,
                        messages=[message.message]
                    )
                )

        except asyncio.CancelledError:
            logger.info("Получение сообщений отменено")
        except Exception as e:
            logger.error(f"Ошибка при получении сообщений: {str(e)}")
        finally:
            async with self.lock:
                if connection_queue in self.connections[chat_name]:
                    self.connections[chat_name].remove(connection_queue)

    async def initialize_chat(self, request_iterator, context):
        """Асинхронный метод для обработки чат-сессии."""
        user = get_user_from_context(context=context)
        first_message = await request_iterator.__anext__()

        if first_message.HasField("init_message"):
            logger.info("Отправляем клиенту уже существующие в чате сообщения")
            chat_name = first_message.init_message.chat_name
            message = await self._prepare_init_message(
                chat_info=first_message.init_message,
                username=user.name
            )
            await self.message_queue.put(message)
        else:
            raise ChatIsNotInitialized("Чат не был инициализирован")

        receive_task = None
        connection_queue = asyncio.Queue()

        try:
            async with self.lock:
                self.connections[chat_name].add(connection_queue)

            # Запускаем задачу для получения сообщений
            receive_task = asyncio.create_task(
                self._receive_messages(request_iterator, connection_queue, chat_name)
            )

            # Отправляем сообщения клиенту
            while not context.done():
                try:
                    message = await asyncio.wait_for(connection_queue.get(), timeout=1.0)
                    yield message
                except asyncio.TimeoutError:
                    continue
                except asyncio.CancelledError:
                    logger.info(f"Соединение отменено")
                    break
                except Exception as e:
                    logger.error(f"Ошибка в соединении: {e}")
                    break

        except Exception as e:
            logger.error(f"Ошибка инициализации чата: {e}")
        finally:
            async with self.lock:
                if connection_queue in self.connections[chat_name]:
                    self.connections[chat_name].remove(connection_queue)

            if not receive_task.done():
                receive_task.cancel()
                try:
                    await receive_task
                except asyncio.CancelledError:
                    pass

            logger.info(f"Соединение закрыто")
