import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/files')({
    component: Files,
});

function Files() {
    return <div>Hello "/files"!</div>;
}
