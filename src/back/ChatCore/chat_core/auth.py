import jwt
import grpc
from typing import NamedTuple, Any

from chat_core.config import config
from chat_core.utils import get_rpc_metadata


class User(NamedTuple):
    name: str

    @staticmethod
    def from_jwt_payload(payload: dict[str, Any]) -> "User":
        name = payload["name"]

        return User(name=name)


def get_jwt_payload_from_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.ALGORITHM])
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError("Не удалось декодировать токен")

    return payload


def get_user_from_context(context: grpc.aio.ServicerContext) -> User:
    jwt_token = get_rpc_metadata(context=context.invocation_metadata())["token"]
    payload = get_jwt_payload_from_token(token=jwt_token)

    return User.from_jwt_payload(payload=payload)
