import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, LayoutGrid, Sun, Moon, Minus, Square, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentWindow } from '@tauri-apps/api/window';
const appWindow = getCurrentWindow();

interface TopBarProps {
    currentFolderName: string;
    selectedIds: number[];
    onShowMoveModal: () => void;
    onBulkDownload: () => void;
    onBulkDelete: () => void;
    onDownloadFolder: () => void;
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export function TopBar({
    currentFolderName, selectedIds, onShowMoveModal, onBulkDownload, onBulkDelete,
    onDownloadFolder, viewMode, setViewMode, searchTerm, onSearchChange
}: TopBarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header 
            className="h-12 border-b border-telegram-border flex items-center px-4 justify-between bg-telegram-surface z-50 select-none sticky top-0"
        >
            {/* Left Section: Breadcrumbs (Draggable) */}
            <div className="flex items-center gap-4 cursor-default" data-tauri-drag-region>
                <div className="flex items-center text-sm font-medium text-telegram-subtext select-none pointer-events-none">
                    <span className="hover:text-telegram-primary cursor-pointer transition-colors pointer-events-auto">Files</span>
                    <span className="mx-2 opacity-50">/</span>
                    <span className="text-telegram-text font-display font-semibold pointer-events-auto">{currentFolderName}</span>
                </div>
            </div>

            {/* Middle Spacer (Draggable) */}
            <div className="flex-1 h-full mx-2" data-tauri-drag-region></div>

            {/* Search Section */}
            <div className="max-w-md w-full relative z-10">
                <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full bg-telegram-bg border border-telegram-border rounded-lg px-4 py-2 text-sm text-telegram-text placeholder:text-telegram-subtext/60 focus:outline-none focus:border-telegram-primary transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Right Spacer (Draggable) */}
            <div className="flex-1 h-full mx-2" data-tauri-drag-region></div>

            {/* Action Buttons & Window Controls */}
            <div className="flex items-center gap-2 relative z-10">
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 mr-4"
                        >
                            <span className="text-xs text-telegram-subtext mr-2">{selectedIds.length} Selected</span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShowMoveModal} className="px-3 py-1.5 bg-telegram-primary/20 hover:bg-telegram-primary/30 text-telegram-primary rounded-md text-xs transition font-medium">Move to...</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBulkDownload} className="px-3 py-1.5 bg-telegram-hover hover:bg-telegram-border rounded-md text-xs text-telegram-text transition">Download Selected</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBulkDelete} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-xs transition">Delete</motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onDownloadFolder} 
                    className="p-2 hover:bg-telegram-hover rounded-md text-telegram-subtext hover:text-telegram-text transition group relative" 
                    title="Download Folder"
                >
                    <HardDrive className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-telegram-surface border border-telegram-border px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        Download All Files
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-telegram-hover rounded-md text-telegram-subtext hover:text-telegram-text transition relative group"
                    title="Toggle Layout"
                >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-telegram-surface border border-telegram-border px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {viewMode === 'grid' ? 'Switch to List' : 'Switch to Grid'}
                    </span>
                </motion.button>

                <div className="w-px h-6 bg-telegram-border mx-1"></div>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-1.5 hover:bg-telegram-hover rounded-md text-telegram-subtext hover:text-telegram-text transition"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.button>

                <div className="w-px h-4 bg-telegram-border mx-1"></div>

                {/* Window Controls */}
                <div className="flex items-center gap-0.5 ml-2">
                    <button 
                        onClick={() => appWindow.minimize()}
                        className="p-1.5 hover:bg-telegram-hover rounded-md text-telegram-subtext hover:text-telegram-text transition"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => appWindow.toggleMaximize()}
                        className="p-1.5 hover:bg-telegram-hover rounded-md text-telegram-subtext hover:text-telegram-text transition"
                    >
                        <Square className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={() => appWindow.close()}
                        className="p-1.5 hover:bg-red-500/10 text-telegram-subtext hover:text-red-500 rounded-md transition"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
