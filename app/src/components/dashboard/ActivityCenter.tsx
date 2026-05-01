import { motion } from 'framer-motion';
import { X, Activity, Download, Upload, Zap, Clock } from 'lucide-react';
import { formatBytes } from '../../utils';
import { BandwidthStats } from '../../types';
import { ActivityHeatmap } from './ActivityHeatmap';

interface ActivityCenterProps {
    isOpen: boolean;
    onClose: () => void;
    bandwidth: BandwidthStats | null;
}

export function ActivityCenter({ isOpen, onClose, bandwidth }: ActivityCenterProps) {
    if (!isOpen) return null;

    return (
        <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 liquid-glass z-[100] flex flex-col shadow-2xl"
        >
            <div className="p-5 border-b border-telegram-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-telegram-primary" />
                    <h2 className="text-display font-bold text-lg tracking-tight">Activity Center</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-telegram-hover rounded-full transition-colors">
                    <X className="w-5 h-5 text-telegram-subtext" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                {/* Bandwidth Section */}
                <section>
                    <h3 className="text-[10px] font-bold text-telegram-subtext uppercase tracking-widest mb-4">Real-time Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-telegram-bg/50 rounded-xl border border-telegram-border group hover:border-telegram-primary/30 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Download className="w-3 h-3 text-green-400" />
                                <span className="text-[10px] font-bold text-telegram-subtext uppercase">Down</span>
                            </div>
                            <p className="text-xl font-display font-bold text-telegram-text">{formatBytes(bandwidth?.down_bytes || 0)}/s</p>
                        </div>
                        <div className="p-4 bg-telegram-bg/50 rounded-xl border border-telegram-border group hover:border-telegram-primary/30 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-bold text-telegram-subtext uppercase">Up</span>
                            </div>
                            <p className="text-xl font-display font-bold text-telegram-text">{formatBytes(bandwidth?.up_bytes || 0)}/s</p>
                        </div>
                    </div>
                </section>

                {/* Storage Activity Heatmap */}
                <section>
                    <h3 className="text-[10px] font-bold text-telegram-subtext uppercase tracking-widest mb-4">Upload History</h3>
                    <div className="p-4 bg-telegram-bg/50 rounded-xl border border-telegram-border">
                        <ActivityHeatmap data={[
                            { date: new Date().toISOString().split('T')[0], count: 12 },
                            { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], count: 5 },
                            { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], count: 8 },
                        ]} />
                    </div>
                </section>

                {/* Recent History */}
                <section>
                    <h3 className="text-[10px] font-bold text-telegram-subtext uppercase tracking-widest mb-4 flex items-center justify-between">
                        Recent Tasks
                        <Clock className="w-3 h-3" />
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 hover:bg-telegram-hover rounded-lg transition-colors cursor-default group">
                            <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-telegram-text truncate">Project_Assets.zip</p>
                                <p className="text-[10px] text-telegram-subtext uppercase">Completed • 45 MB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-telegram-hover rounded-lg transition-colors cursor-default group">
                            <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-telegram-text truncate">Telexio_Logo_v2.png</p>
                                <p className="text-[10px] text-telegram-subtext uppercase">Completed • 2.4 MB</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="p-5 border-t border-telegram-border bg-telegram-bg/50">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-telegram-subtext">Network Status</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Stable
                    </span>
                </div>
                <button className="w-full py-3 bg-telegram-primary/10 hover:bg-telegram-primary/20 text-telegram-primary text-xs font-bold uppercase tracking-widest rounded-lg transition-all">
                    View Network Logs
                </button>
            </div>
        </motion.aside>
    );
}
