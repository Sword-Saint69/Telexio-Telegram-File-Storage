import { useEffect, useRef, useState } from 'react';
import { Eye, HardDrive, Trash2, FolderOpen, Pencil, Play, FileText } from 'lucide-react';
import { TelegramFile } from '../../types';
import { isMediaFile, isPdfFile } from '../../utils';

interface ContextMenuProps {
    x: number;
    y: number;
    file: TelegramFile;
    onClose: () => void;
    onDownload: () => void;
    onDelete: () => void;
    onPreview: () => void;
    onColorChange?: (color: string) => void;
}

export function ContextMenu({ x, y, file, onClose, onDownload, onDelete, onPreview, onColorChange }: ContextMenuProps) {
    const [adjustedPos, setAdjustedPos] = useState({ x, y });
    const menuRef = useRef<HTMLDivElement>(null);

    // Adjust position to stay in bounds
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            let newX = x;
            let newY = y;

            if (x + rect.width > window.innerWidth) {
                newX = x - rect.width;
            }
            if (y + rect.height > window.innerHeight) {
                newY = y - rect.height;
            }
            setAdjustedPos({ x: newX, y: newY });
        }
    }, [x, y]);

    // Close on outside click
    useEffect(() => {
        const handleClick = () => onClose();
        const handleResize = () => onClose();

        window.addEventListener('click', handleClick);
        window.addEventListener('resize', handleResize);
        window.addEventListener('contextmenu', handleClick); // Close if right click elsewhere

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('contextmenu', handleClick);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[200px] liquid-glass rounded-lg shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
            style={{ left: adjustedPos.x, top: adjustedPos.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-2 py-1.5 text-xs text-telegram-subtext font-medium truncate max-w-[180px] border-b border-telegram-border mb-1">
                {file.name}
            </div>

            {file.type !== 'folder' && (
                <button onClick={onPreview} className="flex items-center gap-2 px-2 py-1.5 text-sm text-telegram-text hover:bg-telegram-hover rounded transition-colors text-left w-full">
                    {isMediaFile(file.name) ? (
                        <>
                            <Play className="w-4 h-4 text-telegram-primary" />
                            Play
                        </>
                    ) : isPdfFile(file.name) ? (
                        <>
                            <FileText className="w-4 h-4 text-red-400" />
                            View PDF
                        </>
                    ) : (
                        <>
                            <Eye className="w-4 h-4 text-blue-500" />
                            Preview
                        </>
                    )}
                </button>
            )}

            {file.type === 'folder' && (
                <button onClick={onPreview} className="flex items-center gap-2 px-2 py-1.5 text-sm text-telegram-text hover:bg-telegram-hover rounded transition-colors text-left w-full">
                    <FolderOpen className="w-4 h-4 text-yellow-500" />
                    Open
                </button>
            )}

            <button onClick={onDownload} className="flex items-center gap-2 px-2 py-1.5 text-sm text-telegram-text hover:bg-telegram-hover rounded transition-colors text-left w-full">
                <HardDrive className="w-4 h-4 text-green-500" />
                Download
            </button>

            {file.type === 'folder' && onColorChange && (
                <div className="px-2 py-2">
                    <p className="text-[10px] font-bold text-telegram-subtext uppercase tracking-widest mb-2">Folder Theme</p>
                    <div className="flex gap-2">
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                            <button
                                key={color}
                                onClick={() => { onColorChange(color); onClose(); }}
                                className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            <button disabled className="flex items-center gap-2 px-2 py-1.5 text-sm text-telegram-subtext hover:bg-telegram-hover rounded transition-colors text-left w-full cursor-not-allowed opacity-50">
                <Pencil className="w-4 h-4" />
                Rename
            </button>

            <div className="h-px bg-telegram-border my-1" />

            <button onClick={onDelete} className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors text-left w-full">
                <Trash2 className="w-4 h-4" />
                Delete
            </button>
        </div>
    );
}
