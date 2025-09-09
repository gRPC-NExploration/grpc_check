import logging
from collections import defaultdict
from chat_core.domain.chat import Chat, Message
from chat_core.domain.repository import AbstractChatRepository
from chat_core.infrastracture.exceptions import ChatNotFound, ChatAlreadyExists


class ChatInMemoryRepository(AbstractChatRepository):
    """Класс для чтения и записи сообщений в чатах в памяти."""

    def __init__(self):
        self.chats = defaultdict(tuple[str, Chat])
        self.chats["general"] = Chat.create_new_chat(name="General", creator="system")

    def create_chat(self, chat_name: str, creator: str) -> None:
        """
        Создание нового чата в репозитории.

        Parameters
        ----------
        chat_name : str
            Имя чата.
        creator : str
            Имя создателя чата.
        """

        chat = self.chats.get(chat_name, None)

        if chat is not None:
            return

        self.chats[chat_name] = Chat.create_new_chat(name=chat_name, creator=creator)

    def save_message(self, chat_name: str, message: Message) -> None:
        """
        Сохранение сообщения для переданного чата в репозиторий.

        Parameters
        ----------
        chat_name : str
            Имя чата.
        message : Message
            Сообщение.
        """

        chat = self.chats.get(chat_name, None)

        if chat is None:
            logging.info("Ошибка в репе(")
            raise ChatNotFound(
                f"Чат с именем {chat_name} не найден"
            )

        chat.add_message(message=message)

    def save_chat(self, chat: Chat) -> None:
        """
        Сохранение чата в репозиторий.

        Parameters
        ----------
        chat : Chat
            Чат для сохранения в репозиторий.
        """

        chat_name = chat.name

        self.chats[chat_name] = chat

    def get_messages_by_chat_name(self, chat_name: str) -> list[Message]:
        """
        Получить сообщения в чате chat_name.

        Parameters
        ----------
        chat_name : str
            Имя чата.

        Returns
        -------
        list[Message]
            Сообщения в чате chat_name.
        """

        chat = self.chats.get(chat_name, None)

        if chat is None:
            raise ChatNotFound(
                f"Чат с именем {chat_name} не найден"
            )

        return chat.messages

