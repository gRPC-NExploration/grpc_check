import { Button } from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFiles } from '@/lib/providers/files-provider.tsx';

interface GetFilesFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const Submit = () => {
    return <Button type="submit">Продолжить</Button>;
};

const GetFilesForm = ({ isOpen, onClose }: GetFilesFormProps) => {
    const { getFiles } = useFiles();

    const formAction = async (formData: FormData) => {
        getFiles(formData.get('interval') as unknown as number);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Получить список файлов</DialogTitle>
                    <DialogDescription>
                        Укажите интервал для эмуляции поиска файлов (в секундах)
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={formAction}
                    className="flex flex-col items-end gap-4"
                >
                    <Input
                        type="number"
                        name="interval"
                        defaultValue={0}
                        min={0}
                        placeholder="Интервал (сек)"
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

export default GetFilesForm;
