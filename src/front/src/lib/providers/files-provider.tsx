import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import {
    ChangeEvent,
    PropsWithChildren,
    createContext,
    useContext,
    useState,
} from 'react';
import { toast } from 'sonner';

import { CHUNK_SIZE } from '@/lib/constants/constants.ts';
import { useGrpc } from '@/lib/providers/grpc-provider.tsx';
import { createBlob } from '@/lib/utils/create-blob.ts';
import {
    createProgressToast,
    showErrorToast,
    updateProgressToast,
} from '@/lib/utils/toastUtils.tsx';
import { triggerFileDownload } from '@/lib/utils/trigger-file-download.ts';

import { GetFileNamesResponse } from '../../../proto/App/streaming_back_front_service.ts';
import { Duration } from '../../../proto/google/protobuf/duration.ts';

interface IFilesProviderContext {
    files: GetFileNamesResponse[];
    isFilesFetching: boolean;
    isFilesFetched: boolean;
    getFiles: (interval?: number) => Promise<void>;
    uploadFile: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
    downloadFile: (fileName: string) => Promise<void>;
    clearFiles: () => Promise<void>;
}

const initialState: IFilesProviderContext = {
    files: [],
    isFilesFetching: false,
    isFilesFetched: false,
    getFiles: async () => {},
    uploadFile: async () => {},
    downloadFile: async () => {},
    clearFiles: async () => {},
};

const FilesProviderContext = createContext<IFilesProviderContext>(initialState);

export const FilesProvider = ({ children }: PropsWithChildren) => {
    const { unaryService, streamingService } = useGrpc();

    const [files, setFiles] = useState<GetFileNamesResponse[]>([]);
    const [isFilesFetching, setIsFilesFetching] = useState<boolean>(false);
    const [isFilesFetched, setIsFilesFetched] = useState<boolean>(false);

    const getFiles = async (interval?: number) => {
        setFiles([]);

        try {
            const stream = streamingService.getFileNames({
                interval: interval
                    ? Duration.create({ seconds: BigInt(interval) })
                    : undefined,
            });

            setIsFilesFetching(true);

            for await (const res of stream.responses) {
                if (res) {
                    setFiles(prevState => [...prevState, res]);
                }
            }

            setIsFilesFetching(false);
            setIsFilesFetched(true);
        } catch (error) {
            setIsFilesFetching(false);
            setIsFilesFetched(false);
            showErrorToast(error as RpcError);
        }
    };

    const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        const controller = new AbortController();
        const toastId = createProgressToast(
            'Подготовка к загрузке',
            controller,
        );

        if (file) {
            try {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                let lastUpdatedProgress = 0;

                for (
                    let chunkNumber = 0;
                    chunkNumber < totalChunks;
                    chunkNumber++
                ) {
                    const start = chunkNumber * CHUNK_SIZE;
                    const end = start + CHUNK_SIZE;

                    const chunk = file.slice(start, end);

                    const buffer = await chunk.arrayBuffer();
                    const arr8 = new Uint8Array(buffer);

                    const isFinal = chunkNumber === totalChunks - 1;

                    const currentProgress = Math.floor(
                        ((chunkNumber + 1) * 100) / totalChunks,
                    );

                    if (
                        chunkNumber === 0 ||
                        isFinal ||
                        currentProgress - lastUpdatedProgress >= 2
                    ) {
                        updateProgressToast(
                            toastId,
                            'Загрузка',
                            file.name,
                            currentProgress,
                        );
                        lastUpdatedProgress = currentProgress;
                    }

                    await unaryService.upload(
                        {
                            fileName: file.name,
                            fileBytes: arr8,
                            isFinal: isFinal,
                        },
                        {
                            abort: controller.signal,
                        },
                    );
                }

                toast.success('Файл успешно загружен', {
                    id: toastId,
                    description: undefined,
                    cancel: false,
                    closeButton: true,
                    duration: 3200,
                });
            } catch (error) {
                if ((error as RpcError)?.code == 'CANCELLED') {
                    toast.info('Загрузка файла отменена', {
                        id: toastId,
                        description: undefined,
                        cancel: false,
                        closeButton: true,
                        duration: 3200,
                        className: '',
                        classNames: {
                            content: '',
                            title: '',
                            description: '',
                        },
                    });
                } else {
                    showErrorToast(error as RpcError, {
                        id: toastId,
                        description: undefined,
                        cancel: false,
                        className: '',
                        classNames: {
                            content: '',
                            title: '',
                            description: '',
                        },
                    });
                }
            }
        }
    };

    const downloadFile = async (fileName: string) => {
        const controller = new AbortController();
        const toastId = createProgressToast(
            'Подготовка к скачиванию',
            controller,
        );

        try {
            const stream = streamingService.download(
                {
                    fileName: fileName,
                    chunkSize: CHUNK_SIZE,
                },
                {
                    abort: controller.signal,
                },
            );

            const chunks = new Map<number, Uint8Array>();

            let metaName = '';
            let totalChunks = 0;
            let lastUpdatedProgress = 0;

            const asyncIterator = stream.responses[Symbol.asyncIterator]();
            const firstResult = await asyncIterator.next();

            if (!firstResult.done && firstResult.value) {
                const res = firstResult.value;
                const fileSize = Number(res.metadata?.fileSize as bigint);
                metaName = res.metadata?.fileName as string;

                if (fileSize) {
                    totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
                }

                chunks.set(res.chunk, res.data);
                updateProgressToast(toastId, 'Скачивание', metaName, 0);
            }

            for await (const res of {
                [Symbol.asyncIterator]: () => asyncIterator,
            }) {
                if (res) {
                    chunks.set(res.chunk, res.data);

                    const currentProgress = Math.floor(
                        ((res.chunk + 1) * 100) / totalChunks,
                    );

                    const isFinal = res.chunk + 1 === totalChunks;

                    if (
                        res.chunk === 0 ||
                        isFinal ||
                        currentProgress - lastUpdatedProgress >= 4
                    ) {
                        updateProgressToast(
                            toastId,
                            'Скачивание',
                            metaName,
                            currentProgress,
                        );
                        lastUpdatedProgress = currentProgress;
                    }
                }
            }

            const blob = createBlob(chunks);

            triggerFileDownload(blob, metaName || 'downloaded');

            toast.success('Файл успешно скачан', {
                id: toastId,
                description: undefined,
                cancel: false,
                closeButton: true,
                duration: 3200,
            });
        } catch (error) {
            if ((error as RpcError)?.code == 'CANCELLED') {
                toast.info('Скачивание файла отменено', {
                    id: toastId,
                    description: undefined,
                    cancel: false,
                    closeButton: true,
                    duration: 3200,
                    className: '',
                    classNames: {
                        content: '',
                        title: '',
                        description: '',
                    },
                });
            } else {
                showErrorToast(error as RpcError, {
                    id: toastId,
                    description: undefined,
                    cancel: false,
                    className: '',
                    classNames: {
                        content: '',
                        title: '',
                        description: '',
                    },
                });
            }
        }
    };

    const clearFiles = async () => {
        await unaryService
            .clearStoredFiles({})
            .then(() => {
                setFiles([]);
                setIsFilesFetching(false);
                toast.success('Все файлы успешно удалены', {
                    closeButton: true,
                });
            })
            .catch(error => {
                showErrorToast(error as RpcError);
            });
    };

    return (
        <FilesProviderContext.Provider
            value={{
                files,
                isFilesFetching,
                isFilesFetched,
                getFiles,
                uploadFile,
                downloadFile,
                clearFiles,
            }}
        >
            {children}
        </FilesProviderContext.Provider>
    );
};

export const useFiles = () => {
    const context = useContext(FilesProviderContext);

    if (context === undefined)
        throw new Error('useFiles must be used within a FilesProvider');

    return context;
};
