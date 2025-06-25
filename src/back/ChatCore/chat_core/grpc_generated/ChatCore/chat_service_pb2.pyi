from google.protobuf import timestamp_pb2 as _timestamp_pb2
from ..Common import uuid_pb2 as _uuid_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ChatServiceRequest(_message.Message):
    __slots__ = ("init_message", "message")
    INIT_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    init_message: InitMessage
    message: Message
    def __init__(self, init_message: _Optional[_Union[InitMessage, _Mapping]] = ..., message: _Optional[_Union[Message, _Mapping]] = ...) -> None: ...

class InitMessage(_message.Message):
    __slots__ = ("chat_name",)
    CHAT_NAME_FIELD_NUMBER: _ClassVar[int]
    chat_name: str
    def __init__(self, chat_name: _Optional[str] = ...) -> None: ...

class Message(_message.Message):
    __slots__ = ("uid", "chat_name", "message_text", "sender_name", "message_send_time")
    UID_FIELD_NUMBER: _ClassVar[int]
    CHAT_NAME_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_TEXT_FIELD_NUMBER: _ClassVar[int]
    SENDER_NAME_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_SEND_TIME_FIELD_NUMBER: _ClassVar[int]
    uid: _uuid_pb2.Uuid
    chat_name: str
    message_text: str
    sender_name: str
    message_send_time: _timestamp_pb2.Timestamp
    def __init__(self, uid: _Optional[_Union[_uuid_pb2.Uuid, _Mapping]] = ..., chat_name: _Optional[str] = ..., message_text: _Optional[str] = ..., sender_name: _Optional[str] = ..., message_send_time: _Optional[_Union[datetime.datetime, _timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...

class ChatServiceEvent(_message.Message):
    __slots__ = ("chat_name", "messages")
    CHAT_NAME_FIELD_NUMBER: _ClassVar[int]
    MESSAGES_FIELD_NUMBER: _ClassVar[int]
    chat_name: str
    messages: _containers.RepeatedCompositeFieldContainer[Message]
    def __init__(self, chat_name: _Optional[str] = ..., messages: _Optional[_Iterable[_Union[Message, _Mapping]]] = ...) -> None: ...
