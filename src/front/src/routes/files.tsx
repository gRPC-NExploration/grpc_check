import { createFileRoute } from '@tanstack/react-router';

import FilesHeader from '@/components/features/files/files-header.tsx';
import FilesList from '@/components/features/files/files-list.tsx';
import FilesSkeleton from '@/components/skeletons/files-skeleton.tsx';

export const Route = createFileRoute('/files')({
    component: Files,
    pendingComponent: () => <FilesSkeleton />,
});

function Files() {
    return (
        <section className="bg-sidebar flex size-full flex-col overflow-hidden rounded-lg border">
            <FilesHeader />
            <FilesList />
        </section>
    );
}
