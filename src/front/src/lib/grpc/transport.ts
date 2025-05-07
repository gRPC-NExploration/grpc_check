import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';

import { authInterceptor } from '@/lib/grpc/auth-interceptor.ts';
import { devtoolsInterceptor } from '@/lib/grpc/devtools-interceptor.ts';

const devInterceptors = import.meta.env.PROD ? [] : [devtoolsInterceptor];

export const transport = new GrpcWebFetchTransport({
    baseUrl: import.meta.env.VITE_GRPC_URL,
    format: 'binary',
    interceptors: [authInterceptor, ...devInterceptors],
});
