import { MessagesSquare, X } from 'lucide-react';

import ChatWindowForm from '@/components/features/chat/chat-window-form.tsx';
import ChatWindowList from '@/components/features/chat/chat-window-list.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useMediaQuery } from '@/lib/hooks/use-media-query.ts';
import { useChat } from '@/lib/providers/chat-provider.tsx';
import { cn } from '@/lib/utils/tw-merge.ts';

const ChatWindow = () => {
    const { activeChat, cancelStream } = useChat();
    const isSmallScreen = useMediaQuery(768);

    return (
        <section
            className={cn(
                'bg-sidebar flex h-full w-full flex-col overflow-hidden rounded-lg border-1',
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

                    <ChatWindowList />

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
