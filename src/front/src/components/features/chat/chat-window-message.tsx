import { cn } from '@/lib/utils/tw-merge.ts';

import { MessageResponse } from '../../../../proto/chat_service.ts';

interface ChatWindowMessageProps {
    userName: string | null;
    message: MessageResponse;
    isNewDate: boolean;
    messageTime: string | undefined;
    messageDate: string | undefined;
}

const ChatWindowMessage = ({
    userName,
    message,
    isNewDate,
    messageTime,
    messageDate,
}: ChatWindowMessageProps) => {
    return (
        <>
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
                )}
            >
                {message.senderName !== userName && (
                    <span className="text-chart-1 block text-sm font-medium">
                        {message.senderName}
                    </span>
                )}

                <p className="pr-9 break-words whitespace-pre-wrap">
                    {message.message?.messageText}
                </p>

                <time className="text-muted-foreground absolute right-2 bottom-1 text-xs">
                    {messageTime}
                </time>
            </div>
        </>
    );
};

export default ChatWindowMessage;
