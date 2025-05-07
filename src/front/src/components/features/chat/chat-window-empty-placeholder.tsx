import { MessagesSquare } from 'lucide-react';

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

const ChatWindowEmptyPlaceholder = () => {
    return (
        <div className="flex size-full items-center justify-center">
            <Card className="max-[500px]:bg-sidebar w-full max-w-[350px] max-[500px]:border-none max-[500px]:shadow-none">
                <CardHeader className="max-[376px]:px-2">
                    <CardTitle className="flex flex-col items-center gap-2 text-center text-lg">
                        <MessagesSquare className="size-14" strokeWidth={1} />
                        Сообщений пока нет
                    </CardTitle>
                    <CardDescription className="text-center">
                        Здесь появятся новые сообщения, как только кто-нибудь
                        напишет
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
};

export default ChatWindowEmptyPlaceholder;
