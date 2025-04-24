import { Hash, SquarePen } from 'lucide-react';
import { useState } from 'react';

import CreateOrJoinForm from '@/components/features/chat/create-or-join-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';
import { cn } from '@/lib/utils/tw-merge.ts';

const ChatSidebar = () => {
    const { chats, activeChat, joinRoom } = useChat();

    const [isCreateOrJoinFormOpen, setIsCreateOrJoinFormOpen] = useState(false);

    return (
        <section className="bg-sidebar flex h-full w-full flex-col overflow-hidden rounded-lg md:w-[320px]">
            <div className="flex items-center justify-between border-b-1 px-4 py-2">
                <h1 className="text-lg font-bold" contentEditable>
                    Чаты
                </h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setIsCreateOrJoinFormOpen(true);
                    }}
                >
                    <SquarePen />
                </Button>
                <CreateOrJoinForm
                    isOpen={isCreateOrJoinFormOpen}
                    onClose={() => setIsCreateOrJoinFormOpen(false)}
                />
            </div>
            <ScrollArea className="h-0 flex-1 px-2 py-2">
                {chats.map((chatName, i) => (
                    <button
                        key={i}
                        onClick={() => joinRoom(chatName)}
                        className={cn(
                            'hover:bg-accent/80 mb-2 flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-2 transition-colors',
                            chatName === activeChat &&
                                'bg-accent hover:bg-accent',
                        )}
                    >
                        <Hash className="size-5 shrink-0" />
                        <span className="w-0 flex-1 overflow-hidden text-left overflow-ellipsis">
                            {chatName}
                        </span>
                    </button>
                ))}
            </ScrollArea>
        </section>
    );
};

export default ChatSidebar;
