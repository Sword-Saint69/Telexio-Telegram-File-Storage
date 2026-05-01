import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Folder, Settings, Moon, Command, Activity } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onCommand: (command: string) => void;
}

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (isOpen) onClose();
                else onCommand('open');
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onCommand]);

    const commands = [
        { id: 'search', label: 'Search Files', icon: Search, shortcut: 'F' },
        { id: 'new-folder', label: 'New Folder', icon: Folder, shortcut: 'N' },
        { id: 'settings', label: 'Settings', icon: Settings, shortcut: ',' },
        { id: 'toggle-theme', label: 'Toggle Dark Mode', icon: Moon, shortcut: 'T' },
        { id: 'activity', label: 'Activity Center', icon: Activity, shortcut: 'A' },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="relative w-full max-w-xl bg-telegram-surface border border-telegram-border rounded-xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center px-4 border-b border-telegram-border">
                    <Search className="w-5 h-5 text-telegram-subtext" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="w-full px-4 py-4 bg-transparent text-telegram-text focus:outline-none text-base"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1 px-2 py-1 bg-telegram-bg border border-telegram-border rounded text-[10px] font-bold text-telegram-subtext">
                        <Command className="w-3 h-3" /> K
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => {
                                        onCommand(cmd.id);
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-telegram-primary/5 group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <cmd.icon className="w-4 h-4 text-telegram-subtext group-hover:text-telegram-primary" />
                                        <span className="text-sm font-medium text-telegram-text">{cmd.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-telegram-subtext/40 group-hover:text-telegram-subtext">
                                        {cmd.shortcut}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-sm text-telegram-subtext">No commands found for "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-telegram-bg/50 border-t border-telegram-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-telegram-subtext uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-telegram-surface border border-telegram-border rounded">↑↓</span> Navigate
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-telegram-surface border border-telegram-border rounded">Enter</span> Select
                        </div>
                    </div>
                    <span className="text-[10px] text-telegram-subtext/40">Telexio v1.1.6</span>
                </div>
            </motion.div>
        </div>
    );
}
