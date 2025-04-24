import { format } from 'date-fns';
import { MessagesSquare, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import ChatWindowForm from '@/components/features/chat/chat-window-form.tsx';
import ChatWindowMessage from '@/components/features/chat/chat-window-message.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useMediaQuery } from '@/lib/hooks/use-media-query.ts';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';
import { cn } from '@/lib/utils/tw-merge.ts';

import { Timestamp } from '../../../../proto/google/protobuf/timestamp.ts';

const ChatWindow = () => {
    const { userName } = useAuth();
    const { activeChat, messages, cancelStream } = useChat();
    const isSmallScreen = useMediaQuery(768);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector(
            '[data-radix-scroll-area-viewport]',
        );
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    return (
        <section
            className={cn(
                'bg-sidebar flex h-full w-full flex-col overflow-hidden rounded-lg',
                isSmallScreen && 'absolute top-0 left-0 h-dvh rounded-none',
            )}
        >
            {activeChat ? (
                <>
                    <div className="flex items-center justify-between border-b-1 px-4 py-2">
                        <h1 className="text-lg font-bold">{activeChat}</h1>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                cancelStream();
                            }}
                        >
                            <X />
                        </Button>
                    </div>

                    <ScrollArea
                        ref={scrollAreaRef}
                        className="flex-1 justify-end overflow-hidden"
                    >
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
                    </ScrollArea>

                    <ChatWindowForm />
                </>
            ) : (
                <div className="flex size-full items-center justify-center">
                    <div className="text-muted-foreground flex flex-col items-center gap-2 text-center leading-5">
                        <MessagesSquare className="size-18" strokeWidth={1.2} />
                        <span>
                            Выберите чат
                            <br />
                            или создайте новый
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ChatWindow;
