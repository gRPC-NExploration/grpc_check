from grpc_generated.ChatCore.chat_service_pb2_grpc import ChatServiceServicer
from grpc_generated.ChatCore.chat_service_pb2 import ChatServiceEvent, InitMessage
from grpc_generated.ChatCore.chat_service_pb2 import Message as MessageProto
from infrastracture.repository import ChatInMemoryRepository
from google.protobuf.timestamp_pb2 import Timestamp
from domain.chat import Message
import datetime
import logging
from uuid import uuid4
import asyncio


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
memory_repository = ChatInMemoryRepository()


class ChatServiceAsyncio(ChatServiceServicer):
    def __init__(self):
        self.connections = set()
        self.lock = asyncio.Lock()
        self.message_queue = asyncio.Queue()
        self._active = True
        self._broadcast_task = asyncio.create_task(self._broadcast_worker())

    async def _broadcast_worker(self):
        """Асинхронная фоновая задача для рассылки сообщений."""
        while self._active:
            try:
                message = await self.message_queue.get()
                if message is None:
                    break

                async with self.lock:
                    dead_connections = []
                    for connection in self.connections:
                        try:
                            await connection.put(message)
                        except Exception as e:
                            logger.error(f"Ошибка при отправке сообщения: {e}")
                            dead_connections.append(connection)

                    # Удаляем нерабочие соединения
                    for conn in dead_connections:
                        self.connections.remove(conn)

            except asyncio.CancelledError:
                logger.info("Отправка сообщений отменена")
                break
            except Exception as e:
                logger.error(f"Ошибка в broadcast_worker: {e}")
                await asyncio.sleep(1)

    @staticmethod
    async def _prepare_init_message(chat_info: InitMessage) -> ChatServiceEvent:
        """Подготовка ответа с уже существующими в чате сообщениями."""
        chat_name = chat_info.chat_name
        #TODO: После появления авторизации брать имя пользователя из токена
        memory_repository.create_chat(chat_name=chat_name, creator=f"{chat_name}_creator")
        messages_from_repository = memory_repository.get_messages_by_chat_name(chat_name=chat_name)
        messages = []

        if messages_from_repository:
            for message in messages_from_repository:

                message_timestamp = message.send_time.timestamp()
                message_send_time = Timestamp(seconds=int(message_timestamp))

                messages.append(
                    MessageProto(
                        uid=message.message_id,
                        chat_name=chat_name,
                        message_text=message.text,
                        sender_name=message.sender,
                        message_send_time=message_send_time
                    )
                )

        return ChatServiceEvent(
            chat_name=chat_name,
            messages=messages
        )

    @staticmethod
    async def _handle_message(message: MessageProto) -> None:
        message_send_time = datetime.datetime.fromtimestamp(timestamp=message.message_send_time.seconds)
        chat_name = message.chat_name
        message = Message(
            message_id=message.uid,
            text=message.message_text,
            sender=message.sender_name,
            send_time=message_send_time
        )

        memory_repository.save_message(chat_name=chat_name, message=message)

    async def _receive_messages(self, request_iterator, connection_queue):
        """Асинхронный обработчик входящих сообщений."""
        try:
            async for message in request_iterator:

                if not self._active:
                    break

                if message.HasField("init_message"):
                    logger.info("Отправляем клиенту уже существующие в чате сообщения")
                    message = await self._prepare_init_message(message.init_message)

                else:
                    logger.info("Сохраняем сообщение в репозиторий")
                    await self._handle_message(message=message.message)

                await self.message_queue.put(message)
        except asyncio.CancelledError:
            logger.info("Получение сообщений отменено")
        except Exception as e:
            logger.error(f"Ошибка при получении сообщений: {str(e)}")
        finally:
            async with self.lock:
                if connection_queue in self.connections:
                    self.connections.remove(connection_queue)

    async def initialize_chat(self, request_iterator, context):
        receive_task = None
        """Асинхронный метод для обработки чат-сессии."""
        connection_id = str(uuid4())
        connection_queue = asyncio.Queue(maxsize=10)

        try:
            async with self.lock:
                self.connections.add(connection_queue)
            logger.info(f"Новое подключение: {connection_id}")

            # Запускаем задачу для получения сообщений
            receive_task = asyncio.create_task(
                self._receive_messages(request_iterator, connection_queue)
            )

            # Отправляем сообщения клиенту
            while not context.done() and self._active:
                try:
                    message = await asyncio.wait_for(connection_queue.get(), timeout=1.0)
                    yield message
                except asyncio.TimeoutError:
                    continue
                except asyncio.CancelledError:
                    logger.info(f"Соединение {connection_id} отменено")
                    break
                except Exception as e:
                    logger.error(f"Ошибка в соединении {connection_id}: {e}")
                    break

        except Exception as e:
            logger.error(f"Ошибка инициализации чата: {e}")
        finally:
            # Очищаем ресурсы
            async with self.lock:
                if connection_queue in self.connections:
                    self.connections.remove(connection_queue)

            if 'receive_task' in locals() and not receive_task.done():
                receive_task.cancel()
                try:
                    await receive_task
                except asyncio.CancelledError:
                    pass

            logger.info(f"Соединение закрыто: {connection_id}")
