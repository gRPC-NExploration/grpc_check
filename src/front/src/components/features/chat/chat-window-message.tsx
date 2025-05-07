import { format } from 'date-fns';
import { Check, Clock } from 'lucide-react';
import { Ref } from 'react';

import { IMessageResponse } from '@/lib/providers/chat-provider.tsx';
import { cn } from '@/lib/utils/tw-merge.ts';

import { Timestamp } from '../../../../proto/google/protobuf/timestamp.ts';

interface ChatWindowMessageProps {
    userName: string | null;
    message: IMessageResponse;
    prevMessage: IMessageResponse;
    unreadBubbleRef: Ref<HTMLDivElement>;
}

const ChatWindowMessage = ({
    userName,
    message,
    prevMessage,
    unreadBubbleRef,
}: ChatWindowMessageProps) => {
    const messageTime =
        message.messageSendTime &&
        format(Timestamp.toDate(message.messageSendTime), 'HH:mm');

    const messageDate =
        message.messageSendTime &&
        format(Timestamp.toDate(message.messageSendTime), 'dd.MM.yyyy');

    const prevMessageDate =
        prevMessage &&
        prevMessage.messageSendTime &&
        format(Timestamp.toDate(prevMessage.messageSendTime), 'dd.MM.yyyy');

    const isNewDate = !prevMessageDate || prevMessageDate !== messageDate;

    return (
        <>
            <div
                className={cn(
                    'bg-muted mx-auto hidden rounded-full px-2 py-1 text-sm',
                    isNewDate && 'block',
                )}
            >
                {messageDate}
            </div>

            <div
                ref={unreadBubbleRef}
                className={cn(
                    'bg-muted mx-auto hidden rounded-full px-2 py-1 text-center text-sm',
                    unreadBubbleRef && 'block',
                )}
            >
                Непрочитанные сообщения
            </div>

            <div
                className={cn(
                    'xs:max-w-[20rem] relative inline-block max-w-[16rem] rounded-lg border-b p-2 lg:max-w-[30rem]',
                    message.senderName === userName
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground ml-auto'
                        : 'bg-sidebar-accent text-sidebar-accent-foreground mr-auto',
                    message.senderName === userName &&
                        message.isPending &&
                        'animate-pulse',
                )}
            >
                {message.senderName !== userName && (
                    <span className="text-chart-1 block text-sm font-medium">
                        {message.senderName}
                    </span>
                )}

                <p
                    className={cn(
                        'pr-9 break-words whitespace-pre-wrap',
                        message.senderName === userName && 'pr-13',
                    )}
                >
                    {message.message?.messageText}
                </p>

                <time
                    className={cn(
                        'text-muted-foreground absolute right-2 bottom-1 text-xs',
                        message.senderName === userName &&
                            'flex items-center gap-1',
                    )}
                >
                    {messageTime}

                    {message.senderName === userName && (
                        <>
                            {message.isPending ? (
                                <Clock className="ml-auto size-3" />
                            ) : (
                                <Check className="ml-auto size-3" />
                            )}
                        </>
                    )}
                </time>
            </div>
        </>
    );
};

export default ChatWindowMessage;
