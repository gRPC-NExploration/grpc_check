import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import ChatWindowEmptyPlaceholder from '@/components/features/chat/chat-window-empty-placeholder.tsx';
import ChatWindowMessage from '@/components/features/chat/chat-window-message.tsx';
import ChatWindowScrollBubble from '@/components/features/chat/chat-window-scroll-bubble.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useIsVisible } from '@/lib/hooks/use-is-visible.ts';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { IMessageResponse, useChat } from '@/lib/providers/chat-provider.tsx';

const ChatWindowList = () => {
    const { userName } = useAuth();
    const { messages, isNewRoom, isChatFetched } = useChat();

    const [isScrollBubbleVisible, setScrollBubbleVisible] =
        useState<boolean>(false);
    const [unreadMessages, setUnreadMessages] = useState<IMessageResponse[]>(
        [],
    );

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const unreadBubbleRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const isBottomVisible = useIsVisible(bottomRef);
    const isUnreadBubbleVisible = useIsVisible(unreadBubbleRef);

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

        if (unreadBubbleRef.current) {
            unreadBubbleRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            setScrollBubbleVisible(false);
        } else {
            if (viewport) {
                scrollToBottom(viewport);
            }
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
                setScrollBubbleVisible(false);
                setUnreadMessages([]);
            }

            if (!isBottom && isUserMessage) {
                scrollToBottom(viewport);
                setScrollBubbleVisible(false);
                setUnreadMessages([]);
            }

            if (!isBottom && !isUserMessage) {
                setUnreadMessages(prevState => [
                    ...prevState,
                    messages[messages.length - 1],
                ]);
                setScrollBubbleVisible(true);
            }
        }
    }, [messages, userName]);

    useEffect(() => {
        if (isUnreadBubbleVisible || isBottomVisible) {
            setScrollBubbleVisible(false);

            const timerId = setTimeout(() => {
                setUnreadMessages([]);
            }, 3200);

            return () => {
                clearTimeout(timerId);
            };
        }
    }, [isUnreadBubbleVisible, isScrollBubbleVisible, isBottomVisible]);

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
                                            return (
                                                <ChatWindowMessage
                                                    key={message.uid?.value}
                                                    userName={userName}
                                                    message={message}
                                                    prevMessage={
                                                        messages[i - 1]
                                                    }
                                                    unreadBubbleRef={
                                                        message ===
                                                        unreadMessages[0]
                                                            ? unreadBubbleRef
                                                            : null
                                                    }
                                                />
                                            );
                                        })}
                                    <span
                                        ref={bottomRef}
                                        className="invisible absolute bottom-0 left-0 h-[100px] w-full"
                                    ></span>
                                </div>
                            </div>

                            <ChatWindowScrollBubble
                                isVisible={
                                    isScrollBubbleVisible &&
                                    unreadMessages.length >= 1
                                }
                                handleClickScroll={handleClickScroll}
                                unreadMessagesCount={unreadMessages.length}
                            />
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
