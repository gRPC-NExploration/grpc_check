import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useGrpc } from '@/lib/providers/grpc-provider.tsx';
import { showErrorToast } from '@/lib/utils/toastUtils.ts';

import { Message, MessageResponse } from '../../../proto/chat_service.ts';

interface IChatProviderContext {
    chats: string[];
    activeChat: string;
    messages: MessageResponse[];
    setChats: (chats: string[]) => void;
    setActiveChat: (chatName: string) => void;
    addChat: (chatName: string) => void;
    removeChat: (chatName: string) => void;
    clearChats: () => void;
    joinRoom: (chatName: string) => Promise<void>;
    sendMessage: (message: Message) => Promise<void>;
    cancelStream: () => void;
}

const initialState: IChatProviderContext = {
    chats: ['General'],
    activeChat: '',
    messages: [],
    setChats: () => null,
    setActiveChat: () => null,
    addChat: () => null,
    removeChat: () => null,
    clearChats: () => null,
    joinRoom: async () => {},
    sendMessage: async () => {},
    cancelStream: () => {},
};

const ChatProviderContext = createContext<IChatProviderContext>(initialState);

export const ChatProvider = ({ children }: PropsWithChildren) => {
    const { token } = useAuth();
    const { chatService } = useGrpc();

    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [activeChat, setActiveChat] = useState<string>('');
    const [chats, setChats] = useState<string[]>(() => {
        const stored = localStorage.getItem('chats');
        return stored ? JSON.parse(stored) : initialState.chats;
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const addChat = (chatName: string) => {
        if (!chats.includes(chatName)) {
            setChats(prevChats => [...prevChats, chatName]);
        }
    };

    const removeChat = (chatName: string) => {
        setChats(prevChats => prevChats.filter(chat => chat !== chatName));
    };

    const clearChats = () => {
        localStorage.removeItem('chats');
        setChats(initialState.chats);
    };

    const cancelStream = () => {
        if (abortControllerRef.current) {
            console.log('Attempting to abort gRPC stream...');
            setActiveChat('');
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            console.log('gRPC stream aborted.');
        }
    };

    const joinRoom = async (chatName: string) => {
        cancelStream();
        setActiveChat(chatName);

        if (chatName && token && chatService) {
            setMessages([]);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                console.log(`Joining room: ${chatName}`);
                const stream = chatService.join(
                    { chatName: chatName },
                    {
                        meta: { Authorization: `Bearer ${token}` },
                        abort: controller.signal,
                    },
                );

                for await (const res of stream.responses) {
                    if (controller.signal.aborted) {
                        console.log(
                            'Stream processing stopped due to abort signal.',
                        );
                        break;
                    }

                    if (res.messages) {
                        setMessages(prevState => [
                            ...prevState,
                            ...res.messages,
                        ]);
                    }
                }
                console.log('Stream finished naturally.');
            } catch (error) {
                if ((error as RpcError)?.code === 'CANCELLED') {
                    console.log(
                        'Stream successfully cancelled via AbortController.',
                    );
                } else {
                    console.error('gRPC stream error:', error); // Log other errors
                    showErrorToast(error as RpcError);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        } else {
            console.log(
                'No chatName provided or user not authenticated, ensuring stream is cancelled.',
            );
            cancelStream();
            if (messages.length > 0) {
                setMessages([]);
            }
        }
    };

    const sendMessage = async (message: Message) => {
        try {
            await chatService.sendMessage(
                {
                    chatName: activeChat,
                    messageText: message,
                },
                {
                    meta: { Authorization: `Bearer ${token}` },
                },
            );
        } catch (error) {
            showErrorToast(error as RpcError);
        }
    };

    useEffect(() => {
        return () => {
            console.log(
                'ChatProvider unmounting or token changed, cancelling stream...',
            );
            cancelStream();
        };
    }, [token]);

    useEffect(() => {
        localStorage.setItem('chats', JSON.stringify(chats));
    }, [chats]);

    return (
        <ChatProviderContext.Provider
            value={{
                chats,
                activeChat,
                messages,
                setChats,
                setActiveChat,
                addChat,
                removeChat,
                clearChats,
                joinRoom,
                sendMessage,
                cancelStream,
            }}
        >
            {children}
        </ChatProviderContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatProviderContext);

    if (context === undefined)
        throw new Error('useChat must be used within a ChatProvider');

    return context;
};
