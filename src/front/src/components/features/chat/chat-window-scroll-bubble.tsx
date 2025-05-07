import { ChevronDown } from 'lucide-react';

interface ChatWindowScrollBubbleProps {
    isVisible: boolean;
    handleClickScroll: () => void;
    unreadMessagesCount: number;
}

const ChatWindowScrollBubble = ({
    isVisible,
    unreadMessagesCount,
    handleClickScroll,
}: ChatWindowScrollBubbleProps) => {
    return (
        <>
            {isVisible && (
                <div
                    onClick={handleClickScroll}
                    className="bg-sidebar-accent text-sidebar-accent-foreground absolute right-5 bottom-5 flex size-12 cursor-pointer items-center justify-center rounded-full border shadow"
                >
                    <ChevronDown />

                    <span className="bg-chart-1 absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border p-2 text-center text-sm leading-2 text-white shadow">
                        {unreadMessagesCount}
                    </span>
                </div>
            )}
        </>
    );
};

export default ChatWindowScrollBubble;
