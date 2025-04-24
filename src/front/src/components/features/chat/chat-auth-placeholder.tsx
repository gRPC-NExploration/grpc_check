import { ShieldUser } from 'lucide-react';
import { useState } from 'react';

import LoginForm from '@/components/features/auth/login-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

const ChatAuthPlaceholder = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <div className="bg-sidebar flex size-full flex-col items-center justify-center rounded-lg">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-2 text-lg">
                        <ShieldUser className="size-14" strokeWidth={1} />
                        Требуется авторизация
                    </CardTitle>
                    <CardDescription className="text-center">
                        Пожалуйста, войдите, указав своё имя, чтобы получить
                        доступ к функциям чата.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Button
                        className="w-full"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Войти
                    </Button>
                </CardFooter>
            </Card>
            <LoginForm
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
            />
        </div>
    );
};

export default ChatAuthPlaceholder;
