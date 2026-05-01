import { Upload } from 'lucide-react';

interface EmptyStateProps {
    onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="relative mb-12 group">
                <div className="absolute -inset-4 bg-telegram-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img 
                    src="/src/assets/empty_state.png" 
                    className="w-56 h-56 object-contain relative z-10 animate-float" 
                    alt="Empty Folder Illustration" 
                />
            </div>

            <h3 className="text-xl font-display font-semibold text-telegram-text mb-2 tracking-tight">
                This folder is empty
            </h3>
            <p className="text-telegram-subtext text-sm mb-8 max-w-xs">
                Drag and drop files here, or click the button below to upload from your computer.
            </p>

            <button
                onClick={onUpload}
                className="inline-flex items-center gap-2 px-8 py-3 bg-telegram-primary text-white font-semibold rounded-full hover:bg-telegram-primary/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
                <Upload className="w-5 h-5" />
                Upload Files
            </button>

            <p className="text-xs text-telegram-subtext/50 mt-6">
                Tip: Use <kbd className="px-1.5 py-0.5 bg-telegram-hover rounded text-telegram-subtext">Cmd + F</kbd> to search
            </p>
        </div>
    );
}
