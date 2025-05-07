import { GrpcStatusCode } from '@protobuf-ts/grpcweb-transport';
import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import { ExternalToast, toast } from 'sonner';

import { Button } from '@/components/ui/button.tsx';
import { Progress } from '@/components/ui/progress.tsx';

export const showErrorToast = (error: RpcError, data?: ExternalToast) => {
    if (error.code === GrpcStatusCode[GrpcStatusCode.INVALID_ARGUMENT]) {
        toast.warning(error.message, {
            duration: Infinity,
            closeButton: true,
            ...data,
        });
    } else {
        toast.error(error.message, {
            duration: Infinity,
            closeButton: true,
            ...data,
        });
    }
};

export const createProgressToast = (
    title: string,
    abortController: AbortController,
) => {
    return toast(title, {
        description: () => (
            <div className="flex w-full items-center gap-2">
                <Progress value={Math.round(0)} className="w-full shrink-1" />
            </div>
        ),
        cancel: (
            <Button size="sm" onClick={() => abortController.abort()}>
                Отмена
            </Button>
        ),
        classNames: {
            content: 'overflow-hidden flex-1',
            title: 'text-nowrap w-full overflow-hidden overflow-ellipsis',
            description: 'w-full',
        },
        duration: Infinity,
        className: 'progress-sonner',
    });
};

export const updateProgressToast = (
    id: string | number,
    title: string,
    fileName: string,
    progress: number,
) => {
    toast(`${title} ${fileName}`, {
        id: id,
        description: () => (
            <div className="flex w-full items-center gap-2">
                <Progress
                    value={Math.round(progress)}
                    className="w-full shrink-1"
                />
            </div>
        ),
    });
};
