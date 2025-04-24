import { Outlet, createRootRoute } from '@tanstack/react-router';
import { FolderOpen, MessagesSquare } from 'lucide-react';

import Sidebar, { ISidebarLink } from '@/components/layout/sidebar/sidebar.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

const navItems: ISidebarLink[] = [
    {
        to: '/',
        icon: MessagesSquare,
        tooltip: 'Мессенджер',
    },
    {
        to: '/files',
        icon: FolderOpen,
        tooltip: 'Файлы',
    },
];

export const Route = createRootRoute({
    component: () => (
        <div id="main-layout" className="flex h-svh overflow-hidden p-2">
            <Sidebar links={navItems} />
            <main className="flex w-full gap-2 pl-2">
                <Outlet />
            </main>
            <Toaster richColors />
        </div>
    ),
});
