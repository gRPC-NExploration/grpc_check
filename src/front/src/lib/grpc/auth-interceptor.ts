import {
    RpcInterceptor,
    RpcOptions,
    ServerStreamingCall,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';

export const authInterceptor: RpcInterceptor = {
    interceptUnary(next, method, input, options): UnaryCall {
        processAuthToken(options);
        return next(method, input, options);
    },
    interceptServerStreaming(
        next,
        method,
        input,
        options,
    ): ServerStreamingCall {
        processAuthToken(options);
        return next(method, input, options);
    },
};

const processAuthToken = (options: RpcOptions) => {
    if (!options.meta) {
        options.meta = {};
    }

    const token = localStorage.getItem('token');

    if (token) {
        options.meta['Authorization'] = `Bearer ${token}`;
    } else {
        delete options.meta['Authorization'];
    }
};
