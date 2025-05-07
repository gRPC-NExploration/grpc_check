import { PropsWithChildren, createContext, useContext } from 'react';

import {
    authService,
    chatService,
    streamingService,
    unaryService,
} from '@/lib/grpc/clients.ts';

import { IAuthenticationServiceClient } from '../../../proto/App/authentication_service.client.ts';
import { IChatServiceClient } from '../../../proto/App/chat_service.client.ts';
import { IStreamingBackFrontServiceClient } from '../../../proto/App/streaming_back_front_service.client.ts';
import { IUnaryFrontBackServiceClient } from '../../../proto/App/unary_front_back_service.client.ts';

interface IGrpcProviderContext {
    authService: IAuthenticationServiceClient;
    chatService: IChatServiceClient;
    unaryService: IUnaryFrontBackServiceClient;
    streamingService: IStreamingBackFrontServiceClient;
}

const GrpcProviderContext = createContext<IGrpcProviderContext>({
    authService,
    chatService,
    unaryService,
    streamingService,
});

export const GrpcProvider = ({ children }: PropsWithChildren) => {
    return (
        <GrpcProviderContext.Provider
            value={{ authService, chatService, unaryService, streamingService }}
        >
            {children}
        </GrpcProviderContext.Provider>
    );
};

export const useGrpc = () => {
    const context = useContext(GrpcProviderContext);

    if (context === undefined)
        throw new Error('useGrpc must be used within a GrpcProvider');

    return context;
};
