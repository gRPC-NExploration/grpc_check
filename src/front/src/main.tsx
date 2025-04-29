import { RouterProvider, createRouter } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from '@/lib/providers/auth-provider.tsx';
import { ChatProvider } from '@/lib/providers/chat-provider.tsx';
import { FilesProvider } from '@/lib/providers/files-provider.tsx';
import { GrpcProvider } from '@/lib/providers/grpc-provider.tsx';
import { ThemeProvider } from '@/lib/providers/theme-provider.tsx';
import { routeTree } from '@/routeTree.gen.ts';

import './styles/globals.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <ThemeProvider>
            <GrpcProvider>
                <AuthProvider>
                    <ChatProvider>
                        <FilesProvider>
                            <RouterProvider router={router} />
                        </FilesProvider>
                    </ChatProvider>
                </AuthProvider>
            </GrpcProvider>
        </ThemeProvider>,
    );
}
