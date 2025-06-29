import grpc
from typing import Any, Sequence, Union


Context = Union[grpc.aio.Metadata, Sequence[tuple[str, Union[str, bytes]]], None]


def get_rpc_metadata(context: Context) -> dict[str, Any]:
    items = {key: value for key, value in context}

    return items
