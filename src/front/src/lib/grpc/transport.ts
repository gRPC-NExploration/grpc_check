import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

import { authInterceptor } from '@/lib/grpc/auth-interceptor.ts';

export const transport = new GrpcWebFetchTransport({
    baseUrl: import.meta.env.VITE_GRPC_URL,
    format: 'binary',
    interceptors: [authInterceptor],
});
