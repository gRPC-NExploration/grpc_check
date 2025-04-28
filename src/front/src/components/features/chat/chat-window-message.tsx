import { Check, Clock } from 'lucide-react';
import { Ref } from 'react';

import { IMessageResponse } from '@/lib/providers/chat-provider.tsx';
import { cn } from '@/lib/utils/tw-merge.ts';

interface ChatWindowMessageProps {
    userName: string | null;
    message: IMessageResponse;
    isNewDate: boolean;
    messageTime: string | undefined;
    messageDate: string | undefined;
    unreadBubbleRef?: Ref<HTMLDivElement>;
}

const ChatWindowMessage = ({
    userName,
    message,
    isNewDate,
    messageTime,
    messageDate,
    unreadBubbleRef,
}: ChatWindowMessageProps) => {
    return (
        <>
            {unreadBubbleRef && (
                <div
                    ref={unreadBubbleRef}
                    className="bg-muted mx-auto rounded-full px-2 py-1 text-sm"
                >
                    Непрочитанные сообщения
                </div>
            )}

            {isNewDate && (
                <div className="bg-muted mx-auto rounded-full px-2 py-1 text-sm">
                    {messageDate}
                </div>
            )}

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
