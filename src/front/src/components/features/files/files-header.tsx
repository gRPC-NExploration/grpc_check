import { Download, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import GetFilesForm from '@/components/features/files/get-files-form.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useMediaQuery } from '@/lib/hooks/use-media-query.ts';
import { useFiles } from '@/lib/providers/files-provider.tsx';

const FilesHeader = () => {
    const { uploadFile, clearFiles } = useFiles();

    const isMobile = useMediaQuery(620);
    const [isGetFilesFormOpen, setIsGetFilesFormOpen] = useState(false);

    return (
        <div className="flex items-center justify-between border-b-1 px-4 py-2">
            <h1 className="text-lg font-bold">Файлы</h1>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size={isMobile ? 'icon' : 'lg'}
                    className="h-9"
                    onClick={clearFiles}
                >
                    <Trash2 />
                    {!isMobile && 'Очистить'}
                </Button>
                <Button
                    variant="outline"
                    size={isMobile ? 'icon' : 'lg'}
                    className="h-9"
                    onClick={() => setIsGetFilesFormOpen(true)}
                >
                    <Download />
                    {!isMobile && 'Получить'}
                </Button>
                <Button size={isMobile ? 'icon' : 'lg'} className="h-9" asChild>
                    <label className="relative flex cursor-pointer items-center gap-2">
                        <Upload className="cursor-pointer" />
                        {!isMobile && (
                            <span className="cursor-pointer">Загрузить</span>
                        )}
                        <input
                            type="file"
                            className="invisible absolute h-full w-full cursor-pointer"
                            onChange={e => {
                                uploadFile(e);
                                e.target.value = '';
                            }}
                        />
                    </label>
                </Button>
            </div>

            <GetFilesForm
                isOpen={isGetFilesFormOpen}
                onClose={() => setIsGetFilesFormOpen(false)}
            />
        </div>
    );
};

export default FilesHeader;
