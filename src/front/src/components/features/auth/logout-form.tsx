import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/providers/auth-provider.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

interface LogoutFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const LogoutForm = ({ isOpen, onClose }: LogoutFormProps) => {
    const { logout } = useAuth();
    const { clearChats } = useChat();

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Вы уверены, что хотите выйти?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        После выхода все чаты будут удалены. При следующем входе
                        вам придётся добавить их заново.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            logout();
                            clearChats();
                        }}
                    >
                        Выйти
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LogoutForm;
