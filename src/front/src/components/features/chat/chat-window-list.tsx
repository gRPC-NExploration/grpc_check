import { format } from 'date-fns';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import ChatWindowEmptyPlaceholder from '@/components/features/chat/chat-window-empty-placeholder.tsx';
import ChatWindowMessage from '@/components/features/chat/chat-window-message.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useIsVisible } from '@/lib/hooks/use-is-visible.ts';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

import { Timestamp } from '../../../../proto/google/protobuf/timestamp.ts';

const ChatWindowList = () => {
    const { userName } = useAuth();
    const { messages, isNewRoom, isChatFetched } = useChat();

    const [newHiddenMessages, setNewHiddenMessages] = useState<number>(0);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const isBottomVisible = useIsVisible(bottomRef);

    const getViewport = (): HTMLDivElement | null => {
        return scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]',
        ) as HTMLDivElement | null;
    };

    const scrollToBottom = (viewport: HTMLDivElement) => {
        viewport.scrollTop = viewport.scrollHeight;
    };

    const handleClickScroll = () => {
        const viewport = getViewport();
        if (viewport) {
            scrollToBottom(viewport);
            setNewHiddenMessages(0);
        }
    };

    useEffect(() => {
        if (isChatFetched) {
            const viewport = getViewport();

            if (viewport) {
                scrollToBottom(viewport);
            }
        }
    }, [isChatFetched]);

    useEffect(() => {
        const viewport = getViewport();

        if (viewport) {
            const isBottom =
                viewport.scrollHeight -
                    viewport.scrollTop -
                    viewport.clientHeight <
                100;

            const isUserMessage =
                messages[messages.length - 1]?.senderName === userName;

            if (isBottom) {
                scrollToBottom(viewport);
                setNewHiddenMessages(0);
            }

            if (!isBottom && isUserMessage) {
                scrollToBottom(viewport);
            }

            if (!isBottom && !isUserMessage) {
                setNewHiddenMessages(prevState => prevState + 1);
            }
        }
    }, [messages, userName]);

    useEffect(() => {
        if (newHiddenMessages >= 1 && isBottomVisible) {
            setNewHiddenMessages(0);
        }
    }, [isBottomVisible, newHiddenMessages]);

    return (
        <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 justify-end overflow-hidden"
        >
            {isChatFetched ? (
                <>
                    {messages && !isNewRoom ? (
                        <>
                            <div className="flex h-full flex-col px-2">
                                <div className="flex-grow" />
                                <div className="relative flex flex-col gap-2 pb-2">
                                    {messages &&
                                        messages.map((message, i) => {
                                            const prevMessage = messages[i - 1];

                                            const prevMessageDate =
                                                prevMessage &&
                                                prevMessage.messageSendTime &&
                                                format(
                                                    Timestamp.toDate(
                                                        prevMessage.messageSendTime,
                                                    ),
                                                    'dd.MM.yyyy',
                                                );

                                            const messageDate =
                                                message.messageSendTime &&
                                                format(
                                                    Timestamp.toDate(
                                                        message.messageSendTime,
                                                    ),
                                                    'dd.MM.yyyy',
                                                );

                                            const messageTime =
                                                message.messageSendTime &&
                                                format(
                                                    Timestamp.toDate(
                                                        message.messageSendTime,
                                                    ),
                                                    'HH:mm',
                                                );

                                            const isNewDate =
                                                !prevMessageDate ||
                                                prevMessageDate !== messageDate;

                                            return (
                                                <ChatWindowMessage
                                                    key={i}
                                                    userName={userName}
                                                    message={message}
                                                    isNewDate={isNewDate}
                                                    messageTime={messageTime}
                                                    messageDate={messageDate}
                                                />
                                            );
                                        })}
                                    <span
                                        ref={bottomRef}
                                        className="invisible absolute bottom-0 left-0 h-[100px] w-full"
                                    ></span>
                                </div>
                            </div>
                            {newHiddenMessages >= 1 && (
                                <div
                                    onClick={handleClickScroll}
                                    className="bg-sidebar-primary absolute right-5 bottom-5 flex size-12 cursor-pointer items-center justify-center rounded-full"
                                >
                                    <ChevronDown />

                                    <span className="bg-accent absolute -top-5 left-1/2 -translate-x-1/2 rounded-full p-2 text-center text-sm leading-2">
                                        {newHiddenMessages}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <ChatWindowEmptyPlaceholder />
                    )}
                </>
            ) : (
                <div className="flex size-full items-center justify-center">
                    <Loader2 className="size-8 animate-spin" strokeWidth={1} />
                </div>
            )}
        </ScrollArea>
    );
};

export default ChatWindowList;
