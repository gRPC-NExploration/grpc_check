import { MessagesSquare, X } from 'lucide-react';

import ChatWindowForm from '@/components/features/chat/chat-window-form.tsx';
import ChatWindowList from '@/components/features/chat/chat-window-list.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

const ChatWindow = () => {
    const { activeChat, cancelStream } = useChat();

    return (
        <section className="bg-sidebar flex h-full w-full flex-col overflow-hidden rounded-lg border-1 max-[769px]:absolute max-[769px]:top-0 max-[769px]:left-0 max-[769px]:h-dvh max-[769px]:rounded-none">
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
