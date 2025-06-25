from domain.chat import Message
from grpc_generated.ChatCore.chat_service_pb2 import Message as MessageProto
from grpc_generated.ChatCore.chat_service_pb2 import ChatServiceEvent
from google.protobuf.timestamp_pb2 import Timestamp
import datetime


def get_deserialized_message(message: MessageProto) -> Message:
    message_send_time = datetime.datetime.fromtimestamp(timestamp=message.message_send_time.seconds)

    message = Message(
        message_id=message.uid,
        chat_name=message.chat_name,
        text=message.message_text,
        sender=message.sender_name,
        send_time=message_send_time
    )

    return message


def get_serialized_chat_event(chat_name: str, messages_from_repository: list[Message]) -> ChatServiceEvent:
    """Подготовка ответа с уже существующими в чате сообщениями."""
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