from dataclasses import dataclass, field
from typing import Optional
import datetime


@dataclass
class Message:
    message_id: str
    text: str
    sender: str
    send_time: datetime.datetime


@dataclass
class Chat:
    name: str
    creator: str
    messages: list[Message] = field(default_factory=list)

    @staticmethod
    def create_new_chat(name: str, creator: str) -> "Chat":
        return Chat(name=name, creator=creator)

    def add_message(self, message: Message) -> None:
        self.messages.append(message)
