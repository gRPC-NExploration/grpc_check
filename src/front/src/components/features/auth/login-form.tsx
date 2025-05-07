import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/providers/auth-provider.tsx';

interface AuthFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const Submit = () => {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending}>
            Войти
        </Button>
    );
};

const LoginForm = ({ isOpen, onClose }: AuthFormProps) => {
    const { login } = useAuth();

    const formAction = async (formData: FormData) => {
        await login(formData.get('userName') as string);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Войти</DialogTitle>
                    <DialogDescription>
                        Введите имя, чтобы войти
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={formAction}
                    className="flex flex-col items-end gap-4"
                >
                    <Input type="text" name="userName" placeholder="Имя" />
                    <Submit />
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginForm;
