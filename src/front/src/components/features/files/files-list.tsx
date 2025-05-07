import FilesCard from '@/components/features/files/files-card.tsx';
import FilesEmptyPlaceholder from '@/components/features/files/files-empty-placeholder.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useFiles } from '@/lib/providers/files-provider.tsx';

const FilesList = () => {
    const { files, isFilesFetching, isFilesFetched } = useFiles();

    return (
        <ScrollArea className="flex-1 overflow-hidden">
            {(files && files.length > 0) || isFilesFetching ? (
                <div className="flex w-full flex-wrap content-start items-center justify-between gap-2 p-2">
                    {files.map(file => (
                        <FilesCard
                            key={file.fileName}
                            fileName={file.fileName}
                        />
                    ))}

                    {isFilesFetching && (
                        <div className="bg-muted h-[135px] w-[110px] animate-pulse rounded-lg" />
                    )}

                    {Array.from({ length: 15 }).map((_, idx) => (
                        <div key={idx} className="h-0 w-[110px]" />
                    ))}
                </div>
            ) : (
                <FilesEmptyPlaceholder wasRequested={isFilesFetched} />
            )}
        </ScrollArea>
    );
};

export default FilesList;
