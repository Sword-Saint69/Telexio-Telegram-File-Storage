import { useState } from 'react';
import { Plus, Pin, PinOff } from 'lucide-react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDelete?: () => void;
    onPin?: () => void;
    folderId: number | null;
    color?: string;
    isPinned?: boolean;
}

/**
 * SidebarItem - Pure DOM event-based drop handling
 * 
 * With Tauri's dragDropEnabled: false, DOM events work reliably.
 * This component handles internal file moves via standard React drag events.
 */
export function SidebarItem({ 
    icon: Icon, label, active = false, onClick, onDrop, onDelete, onPin, color, isPinned 
}: SidebarItemProps) {
    const [isOver, setIsOver] = useState(false);

    return (
        <button
            onClick={onClick}
            onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(true);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only clear if truly leaving (not entering a child element)
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                    setIsOver(false);
                }
            }}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(false);
                if (onDrop) onDrop(e);
            }}
            onContextMenu={(e) => {
                if (onDelete) {
                    e.preventDefault();
                    onDelete();
                }
            }}
            className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                ? 'bg-telegram-primary/10 text-telegram-primary'
                : isOver
                    ? 'bg-telegram-primary/20 text-telegram-primary'
                    : 'text-telegram-subtext hover:bg-telegram-hover hover:text-telegram-text'
                }`}
        >
            <Icon 
                className={`w-4 h-4 ${isOver ? 'text-telegram-primary' : ''}`} 
                style={color ? { color } : undefined}
            />
            <span className="flex-1 text-left truncate">{label}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onPin && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); onPin(); }} 
                        className={`p-1 rounded hover:bg-telegram-primary/20 ${isPinned ? 'text-telegram-primary' : 'text-telegram-subtext'}`}
                        title={isPinned ? "Unpin Folder" : "Pin Folder"}
                    >
                        {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    </div>
                )}
                {onDelete && (
                    <div 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                        className="p-1 hover:text-red-400"
                        title="Delete Folder"
                    >
                        <Plus className="w-3 h-3 rotate-45" />
                    </div>
                )}
            </div>
        </button>
    )
}
