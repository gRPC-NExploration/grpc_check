import { Download, PackageSearch, SearchX } from 'lucide-react';
import { useState } from 'react';

import GetFilesForm from '@/components/features/files/get-files-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card.tsx';

interface FilesEmptyPlaceholderProps {
    wasRequested: boolean;
}

const FilesEmptyPlaceholder = ({
    wasRequested,
}: FilesEmptyPlaceholderProps) => {
    const [isGetFilesFormOpen, setIsGetFilesFormOpen] = useState(false);

    return (
        <div className="flex size-full items-center justify-center">
            <Card className="max-[500px]:bg-sidebar w-full max-w-[350px] max-[500px]:border-none max-[500px]:shadow-none">
                <CardHeader className="max-[376px]:px-2">
                    <CardTitle className="flex flex-col items-center gap-2 text-center text-lg">
                        {wasRequested ? (
                            <>
                                <SearchX className="size-14" strokeWidth={1} />
                                Файлы не найдены
                            </>
                        ) : (
                            <>
                                <PackageSearch
                                    className="size-14"
                                    strokeWidth={1}
                                />
                                Файлы не загружены
                            </>
                        )}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {wasRequested
                            ? 'Вы можете загрузить файлы прямо сейчас или попробовать обновить список позже'
                            : 'Нажмите кнопку "Получить", чтобы загрузить список файлов'}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Button
                        className="w-full"
                        onClick={() => setIsGetFilesFormOpen(true)}
                    >
                        <Download />
                        Получить файлы
                    </Button>
                </CardFooter>
            </Card>

            <GetFilesForm
                isOpen={isGetFilesFormOpen}
                onClose={() => setIsGetFilesFormOpen(false)}
            />
        </div>
    );
};

export default FilesEmptyPlaceholder;
