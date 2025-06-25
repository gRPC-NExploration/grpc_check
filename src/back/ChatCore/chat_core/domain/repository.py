from abc import ABC, abstractmethod
from domain.chat import Message, Chat


class AbstractChatRepository(ABC):

    @abstractmethod
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

    @abstractmethod
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

    @abstractmethod
    def save_chat(self, chat: Chat) -> None:
        """
        Сохранение чата в репозиторий.

        Parameters
        ----------
        chat : Chat
            Чат для сохранения в репозиторий.
        """

    @abstractmethod
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
