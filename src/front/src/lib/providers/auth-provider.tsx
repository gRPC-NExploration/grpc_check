import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

import { useGrpc } from '@/lib/providers/grpc-provider.tsx';
import { showErrorToast } from '@/lib/utils/toastUtils.tsx';

interface IAuthProviderContext {
    token: string | null;
    setToken: (token: string) => void;
    userName: string | null;
    setUserName: (userName: string) => void;
    login: (name: string) => Promise<void>;
    logout: () => void;
}

const AuthProviderContext = createContext<IAuthProviderContext | undefined>(
    undefined,
);

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const { authService } = useGrpc();

    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('token') || null,
    );
    const [userName, setUserName] = useState<string | null>(
        () => localStorage.getItem('userName') || null,
    );

    const login = async (userName: string) => {
        await authService
            .getBearerToken({
                userName: userName,
            })
            .then(res => {
                setToken(res.response.bearerToken);
                localStorage.setItem('token', res.response.bearerToken);

                setUserName(userName);
                localStorage.setItem('userName', userName);

                toast.success('Вход выполнен успешно.', {
                    closeButton: true,
                });
            })
            .catch((error: RpcError) => {
                showErrorToast(error);
            });
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');

        setUserName(null);
        localStorage.removeItem('userName');
    };

    return (
        <AuthProviderContext.Provider
            value={{ token, setToken, userName, setUserName, login, logout }}
        >
            {children}
        </AuthProviderContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthProviderContext);

    if (context === undefined)
        throw new Error('useAuth must be used within a AuthProvider');

    return context;
};
