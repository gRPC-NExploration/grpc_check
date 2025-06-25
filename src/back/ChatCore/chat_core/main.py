from concurrent import futures
import grpc
import asyncio
import logging
from servicers.chat_core_servicer import ChatServiceAsyncio
from grpc_generated.ChatCore.chat_service_pb2_grpc import add_ChatServiceServicer_to_server
from interceptors.logger import LoggingInterceptor


MAX_MESSAGE_LENGTH = 40000000


async def serve():
    server = grpc.aio.server(
        futures.ThreadPoolExecutor(max_workers=10),
        interceptors=[LoggingInterceptor(tag='logging')],
    )
    add_ChatServiceServicer_to_server(ChatServiceAsyncio(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    logging.info("server started")
    await server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.get_event_loop().run_until_complete(serve())
