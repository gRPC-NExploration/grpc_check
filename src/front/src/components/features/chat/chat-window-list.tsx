import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

import ChatWindowEmptyPlaceholder from '@/components/features/chat/chat-window-empty-placeholder.tsx';
import ChatWindowMessage from '@/components/features/chat/chat-window-message.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

import { Timestamp } from '../../../../proto/google/protobuf/timestamp.ts';

const ChatWindowList = () => {
    const { userName } = useAuth();
    const { messages, isNewRoom } = useChat();

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]',
        ) as HTMLDivElement;

        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    return (
        <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 justify-end overflow-hidden"
        >
            {messages && !isNewRoom ? (
                <>
                    <div className="flex h-full flex-col px-2">
                        <div className="flex-grow" />
                        <div className="flex flex-col gap-2 pb-2">
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
                        </div>
                    </div>
                </>
            ) : (
                <ChatWindowEmptyPlaceholder />
            )}
        </ScrollArea>
    );
};

export default ChatWindowList;
