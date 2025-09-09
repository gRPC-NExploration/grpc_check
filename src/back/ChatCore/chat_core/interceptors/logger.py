import grpc
from typing import Optional, Callable, Awaitable
import logging


class LoggingInterceptor(grpc.aio.ServerInterceptor):
    def __init__(self, tag: str, rpc_id: Optional[str] = None) -> None:
        self.tag = tag
        self.rpc_id = rpc_id

    async def intercept_service(
            self,
            continuation: Callable[
                [grpc.HandlerCallDetails], Awaitable[grpc.RpcMethodHandler]
            ],
            handler_call_details: grpc.HandlerCallDetails,
    ) -> grpc.RpcMethodHandler:
        logging.info(dict(handler_call_details.invocation_metadata))
        logging.info(handler_call_details.method)
        return await continuation(handler_call_details)