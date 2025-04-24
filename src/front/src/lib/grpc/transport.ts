import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

export const transport = new GrpcWebFetchTransport({
    baseUrl: import.meta.env.VITE_GRPC_URL,
    format: 'binary',
});
