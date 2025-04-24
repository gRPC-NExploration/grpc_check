import { GrpcStatusCode } from '@protobuf-ts/grpcweb-transport';
import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import { toast } from 'sonner';

export const showErrorToast = (error: RpcError) => {
    if (error.code === GrpcStatusCode[GrpcStatusCode.INTERNAL]) {
        toast.error(error.message, {
            duration: Infinity,
            closeButton: true,
        });
    } else {
        toast.warning(error.message, {
            duration: Infinity,
            closeButton: true,
        });
    }
};
