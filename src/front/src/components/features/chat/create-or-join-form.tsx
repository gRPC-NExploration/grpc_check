import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

interface CreateOrJoinFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const Submit = () => {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" loading={pending}>
            Продолжить
        </Button>
    );
};

const CreateOrJoinForm = ({ isOpen, onClose }: CreateOrJoinFormProps) => {
    const { addChat } = useChat();

    const formAction = async (formData: FormData) => {
        addChat(formData.get('chatName') as string);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Начать общение</DialogTitle>
                    <DialogDescription>
                        Введите название, чтобы присоединиться к существующему
                        чату или создать новый.
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={formAction}
                    className="flex flex-col items-end gap-4"
                >
                    <Input
                        type="text"
                        name="chatName"
                        placeholder="Название чата"
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Submit />
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateOrJoinForm;
