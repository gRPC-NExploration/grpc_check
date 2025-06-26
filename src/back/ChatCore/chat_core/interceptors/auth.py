import grpc
from typing import Callable, Awaitable
import jwt
from interceptors.config import config


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
        jwt_token = dict(handler_call_details.invocation_metadata)["token"]
        payload = jwt.decode(jwt_token, config.JWT_SECRET_KEY, algorithms=[config.ALGORITHM])
        username: str = payload.get("name", None)

        if not username:
            return self._abort_handler

        return await continuation(handler_call_details)
