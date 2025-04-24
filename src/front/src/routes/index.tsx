import { createFileRoute } from '@tanstack/react-router';

import ChatAuthPlaceholder from '@/components/features/chat/chat-auth-placeholder.tsx';
import ChatSidebar from '@/components/features/chat/chat-sidebar.tsx';
import ChatWindow from '@/components/features/chat/chat-window.tsx';
import ChatSidebarSkeleton from '@/components/skeletons/chat-sidebar-skeleton.tsx';
import ChatWindowSkeleton from '@/components/skeletons/chat-window-skeleton.tsx';
import { useMediaQuery } from '@/lib/hooks/use-media-query.ts';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

export const Route = createFileRoute('/')({
    component: Chat,
    pendingComponent: () => (
        <>
            <ChatSidebarSkeleton />
            <ChatWindowSkeleton />
        </>
    ),
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
