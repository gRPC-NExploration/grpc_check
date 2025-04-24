import { PropsWithChildren, createContext, useContext } from 'react';

import { authService, chatService } from '@/lib/grpc/clients.ts';

import { IAuthenticationServiceClient } from '../../../proto/authentication_service.client.ts';
import { IChatServiceClient } from '../../../proto/chat_service.client.ts';

interface IGrpcProviderContext {
    authService: IAuthenticationServiceClient;
    chatService: IChatServiceClient;
}

const GrpcProviderContext = createContext<IGrpcProviderContext>({
    authService,
    chatService,
});

export const GrpcProvider = ({ children }: PropsWithChildren) => {
    return (
        <GrpcProviderContext.Provider value={{ authService, chatService }}>
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
