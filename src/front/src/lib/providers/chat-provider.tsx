import { RpcError } from '@protobuf-ts/runtime-rpc/build/types/rpc-error';
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useGrpc } from '@/lib/providers/grpc-provider.tsx';
import { showErrorToast } from '@/lib/utils/toastUtils.ts';

import { Message, MessageResponse } from '../../../proto/App/chat_service.ts';
import { Timestamp } from '../../../proto/google/protobuf/timestamp.ts';

export interface IMessageResponse extends MessageResponse {
    isPending?: boolean;
}

interface IChatProviderContext {
    chats: string[];
    activeChat: string;
    messages: IMessageResponse[];
    isNewRoom: boolean;
    isChatFetched: boolean;
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
    isNewRoom: false,
    isChatFetched: false,
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
    const { token, userName } = useAuth();
    const { chatService } = useGrpc();

    const [messages, setMessages] = useState<IMessageResponse[]>([]);
    const [activeChat, setActiveChat] = useState<string>('');
    const [isNewRoom, setIsNewRoom] = useState<boolean>(false);
    const [isChatFetched, setIsChatFetched] = useState<boolean>(false);
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
            setMessages([]);
            setActiveChat('');
            setIsChatFetched(false);
            setIsNewRoom(false);
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const joinRoom = async (chatName: string) => {
        cancelStream();
        setActiveChat(chatName);

        if (chatName && token && chatService) {
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const stream = chatService.join(
                    { chatName: chatName },
                    {
                        meta: { Authorization: `Bearer ${token}` },
                        abort: controller.signal,
                    },
                );

                for await (const res of stream.responses) {
                    if (controller.signal.aborted) {
                        break;
                    }

                    setIsChatFetched(true);

                    if (res.messages) {
                        if (res.messages.length === 0) {
                            setIsNewRoom(true);
                        } else {
                            setIsNewRoom(false);
                        }

                        setMessages(prevState => {
                            const unconfirmedMessages: IMessageResponse[] = [];

                            const newState: IMessageResponse[] =
                                prevState?.filter(localMsg => {
                                    const isConfirmedByServer =
                                        res.messages?.some(
                                            serverMsg =>
                                                serverMsg.uid?.value ===
                                                    localMsg.uid?.value &&
                                                serverMsg.senderName ===
                                                    localMsg.senderName,
                                        );

                                    if (
                                        localMsg.isPending &&
                                        isConfirmedByServer
                                    ) {
                                        return false;
                                    } else if (
                                        localMsg.isPending &&
                                        !isConfirmedByServer
                                    ) {
                                        unconfirmedMessages.push(localMsg);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }) ?? [];

                            return [
                                ...newState,
                                ...res.messages,
                                ...unconfirmedMessages,
                            ];
                        });
                    }
                }
            } catch (error) {
                if ((error as RpcError)?.code !== 'CANCELLED') {
                    cancelStream();
                    showErrorToast(error as RpcError);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        } else {
            cancelStream();
            if (messages.length > 0) {
                setMessages([]);
            }
        }
    };

    const sendMessage = async (message: Message) => {
        const id = {
            value: uuidv4(),
        };

        try {
            setMessages(prevState => [
                ...prevState,
                {
                    uid: id,
                    isPending: true,
                    message: message,
                    senderName: userName as string,
                    chatName: activeChat,
                    messageSendTime: Timestamp.now(),
                },
            ]);

            if (isNewRoom) {
                setIsNewRoom(false);
            }

            await chatService.sendMessage(
                {
                    uid: id,
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
                isNewRoom,
                isChatFetched,
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
