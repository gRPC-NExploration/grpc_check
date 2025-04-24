import { createFileRoute } from '@tanstack/react-router';

import ChatAuthPlaceholder from '@/components/features/chat/chat-auth-placeholder.tsx';
import ChatSidebar from '@/components/features/chat/chat-sidebar.tsx';
import ChatWindow from '@/components/features/chat/chat-window.tsx';
import { useMediaQuery } from '@/lib/hooks/use-media-query.ts';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

export const Route = createFileRoute('/')({
    component: Chat,
});

function Chat() {
    const { token, userName } = useAuth();
    const { activeChat } = useChat();
    const isSmallScreen = useMediaQuery(768);

    return (
        <>
            {token && userName ? (
                <>
                    {isSmallScreen ? (
                        <>{activeChat ? <ChatWindow /> : <ChatSidebar />}</>
                    ) : (
                        <>
                            <ChatSidebar />
                            <ChatWindow />
                        </>
                    )}
                </>
            ) : (
                <ChatAuthPlaceholder />
            )}
        </>
    );
}
