import { File } from 'lucide-react';

import { useFiles } from '@/lib/providers/files-provider.tsx';

interface FilesCardProps {
    fileName: string;
}

const FilesCard = ({ fileName }: FilesCardProps) => {
    const { downloadFile } = useFiles();

    return (
        <div
            title={fileName}
            onClick={() => downloadFile(fileName)}
            className="hover:bg-sidebar-accent flex h-[135px] w-[110px] cursor-pointer flex-col items-center justify-between gap-2 rounded-lg p-2 text-center select-none"
        >
            <div className="size-[72px]">
                <File className="size-full" strokeWidth={1} />
            </div>
            <div className="flex w-full items-start justify-center overflow-hidden">
                <span className="line-clamp-2 text-center text-sm break-words">
                    {fileName}
                </span>
            </div>
        </div>
    );
};

export default FilesCard;
