import grpc
from typing import Callable, Awaitable
import jwt
from chat_core.auth import get_jwt_payload_from_token
from chat_core.utils import get_rpc_metadata


class JWTCheckInterceptor(grpc.aio.ServerInterceptor):
    def __init__(self):
        def abort(ignored_request, context: grpc.aio.ServicerContext) -> None:
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("Пользователь не найден")
            context.abort(grpc.StatusCode.UNAUTHENTICATED)

        self._abort_handler = grpc.unary_unary_rpc_method_handler(abort)

    async def intercept_service(
            self,
            continuation: Callable[
                [grpc.HandlerCallDetails], Awaitable[grpc.RpcMethodHandler]
            ],
            handler_call_details: grpc.HandlerCallDetails,
    ) -> grpc.RpcMethodHandler:
        jwt_token = dict(handler_call_details.invocation_metadata).get("token", None)

        if jwt_token is None:
            return self._abort_handler

        try:
            get_jwt_payload_from_token(token=jwt_token)
        except jwt.InvalidTokenError as e:
            return self._abort_handler

        return await continuation(handler_call_details)
