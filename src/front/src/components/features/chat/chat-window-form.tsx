import { SendHorizonal } from 'lucide-react';
import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

import { Button } from '@/components/ui/button.tsx';
import { useChat } from '@/lib/providers/chat-provider.tsx';

import { Message } from '../../../../proto/chat_service.ts';

const ChatWindowForm = () => {
    const [message, setMessage] = useState<Message>({ messageText: '' });
    const { sendMessage } = useChat();

    const inputRef = useRef<HTMLDivElement>(null);

    const handleSubmit = () => {
        if (message.messageText.trim()) {
            sendMessage(message);
            setMessage({ messageText: '' });

            if (inputRef.current) {
                const selection = window.getSelection();
                const range = document.createRange();

                inputRef.current.innerText = '';
                inputRef.current.focus();

                range.setStart(inputRef.current, 0);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit();
    };

    const handleInput = () => {
        if (inputRef.current) {
            setMessage({
                messageText: inputRef.current.textContent || '',
            });
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const isEnter = e.key === 'Enter';

        if (isMobile) {
            return;
        }

        if (isEnter && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="flex items-end gap-2 border-t-1 p-4"
        >
            <div className="relative w-full max-w-full overflow-hidden">
                {message.messageText === '' && (
                    <span className="text-muted-foreground pointer-events-none absolute top-2 left-3 text-sm">
                        Сообщение...
                    </span>
                )}
                <div
                    ref={inputRef}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    className="chat-input-scroll max-h-60 min-h-9 w-full overflow-y-auto rounded-md border bg-transparent px-3 py-2 text-base leading-[1.2] break-words whitespace-pre-wrap shadow-xs outline-none focus:outline-none"
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    style={{
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                />
            </div>
            <Button
                type="submit"
                size="icon"
                disabled={!message?.messageText.trim()}
            >
                <SendHorizonal />
            </Button>
        </form>
    );
};

export default ChatWindowForm;
