import { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Folder, Plus, RefreshCw, LogOut } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { BandwidthWidget } from './BandwidthWidget';
import { TelegramFolder, BandwidthStats } from '../../types';

interface SidebarProps {
    folders: TelegramFolder[];
    activeFolderId: number | null;
    setActiveFolderId: (id: number | null) => void;
    onDrop: (e: React.DragEvent, folderId: number | null) => void;
    onDelete: (id: number, name: string) => void;
    onCreate: (name: string) => Promise<void>;
    isSyncing: boolean;
    isConnected: boolean;
    onSync: () => void;
    onLogout: () => void;
    bandwidth: BandwidthStats | null;
    onPin: (id: number) => void;
}

export function Sidebar({
    folders, activeFolderId, setActiveFolderId, onDrop, onDelete, onCreate,
    isSyncing, isConnected, onSync, onLogout, bandwidth, onPin
}: SidebarProps) {
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const submitCreate = async () => {
        if (!newFolderName.trim()) return;
        try {
            await onCreate(newFolderName);
            setNewFolderName("");
            setShowNewFolderInput(false);
        } catch {
            // handled by parent
        }
    }

    return (
        <aside className="w-64 bg-telegram-surface border-r border-telegram-border flex flex-col" onClick={e => e.stopPropagation()}>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 flex items-center gap-3"
            >
                <img src="/logo.png" className="w-8 h-8 object-contain" alt="Telexio Logo" />
                <span className="font-display font-bold text-lg text-telegram-text tracking-tight uppercase">Telexio</span>
            </motion.div>

            {/* Scrollable folder list */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
                <SidebarItem
                    icon={HardDrive}
                    label="Saved Messages"
                    active={activeFolderId === null}
                    onClick={() => setActiveFolderId(null)}
                    onDrop={(e: React.DragEvent) => onDrop(e, null)}
                    folderId={null}
                />

                {folders.filter(f => f.is_pinned).length > 0 && (
                    <div className="pt-4 pb-2">
                        <span className="px-3 text-[10px] font-bold text-telegram-subtext uppercase tracking-widest opacity-50">Pinned</span>
                        <div className="mt-2 space-y-1">
                            {folders.filter(f => f.is_pinned).map((folder, index) => (
                                <motion.div
                                    key={`pinned-${folder.id}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <SidebarItem
                                        icon={Folder}
                                        label={folder.name}
                                        active={activeFolderId === folder.id}
                                        onClick={() => setActiveFolderId(folder.id)}
                                        onDrop={(e: React.DragEvent) => onDrop(e, folder.id)}
                                        onDelete={() => onDelete(folder.id, folder.name)}
                                        onPin={() => onPin(folder.id)}
                                        folderId={folder.id}
                                        color={folder.color}
                                        isPinned={true}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 pb-2">
                    {folders.filter(f => f.is_pinned).length > 0 && (
                        <span className="px-3 text-[10px] font-bold text-telegram-subtext uppercase tracking-widest opacity-50">Folders</span>
                    )}
                    <div className="mt-2 space-y-1">
                        {folders.filter(f => !f.is_pinned).map((folder, index) => (
                            <motion.div
                                key={folder.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <SidebarItem
                                    icon={Folder}
                                    label={folder.name}
                                    active={activeFolderId === folder.id}
                                    onClick={() => setActiveFolderId(folder.id)}
                                    onDrop={(e: React.DragEvent) => onDrop(e, folder.id)}
                                    onDelete={() => onDelete(folder.id, folder.name)}
                                    onPin={() => onPin(folder.id)}
                                    folderId={folder.id}
                                    color={folder.color}
                                    isPinned={false}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Sticky Create Folder section — always visible above the footer */}
            <div className="px-3 pb-4">
                {showNewFolderInput ? (
                    <div className="py-2">
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-telegram-bg border border-telegram-border rounded-lg px-3 py-2 text-sm text-telegram-text focus:outline-none focus:ring-2 focus:ring-telegram-primary/50"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitCreate()}
                            onBlur={() => !newFolderName && setShowNewFolderInput(false)}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setShowNewFolderInput(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-telegram-primary bg-telegram-primary/5 hover:bg-telegram-primary/10 rounded-lg transition-all border border-dashed border-telegram-primary/30"
                    >
                        <Plus className="w-4 h-4" />
                        Create Folder
                    </button>
                )}
            </div>

            {/* Storage Intelligence Meter */}
            <div className="px-6 py-8 border-t border-telegram-border/50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-telegram-subtext uppercase tracking-widest">Storage</span>
                    <span className="text-[10px] font-bold text-telegram-primary">1.2/2.0 GB</span>
                </div>
                <div className="h-1 w-full bg-telegram-border/30 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-telegram-primary"
                    ></motion.div>
                </div>
            </div>

            <div className="p-4 border-t border-telegram-border">
                <div className="flex items-center gap-2 text-telegram-subtext text-xs">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{isConnected ? 'Connected to Telegram' : 'Disconnected from Telegram'}</span>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onSync}
                        disabled={isSyncing}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Scan for existing folders"
                    >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-3 h-3" />
                        Logout
                    </button>
                </div>

                {bandwidth && <BandwidthWidget bandwidth={bandwidth} />}
            </div>

        </aside>
    )
}
