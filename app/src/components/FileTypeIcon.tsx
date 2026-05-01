import {
    File, FileText, FileImage, FileVideo, FileAudio,
    FileArchive, FileCode, FileSpreadsheet, Presentation,
    FileType
} from 'lucide-react';

const extensionMap: Record<string, { icon: typeof File; color: string }> = {
    // Images
    jpg: { icon: FileImage, color: 'text-[#ec4899]' },
    jpeg: { icon: FileImage, color: 'text-[#ec4899]' },
    png: { icon: FileImage, color: 'text-[#ec4899]' },
    gif: { icon: FileImage, color: 'text-[#ec4899]' },
    webp: { icon: FileImage, color: 'text-[#ec4899]' },
    svg: { icon: FileImage, color: 'text-[#ec4899]' },
    bmp: { icon: FileImage, color: 'text-[#ec4899]' },
    heic: { icon: FileImage, color: 'text-[#ec4899]' },

    // Videos
    mp4: { icon: FileVideo, color: 'text-[#8b5cf6]' },
    mov: { icon: FileVideo, color: 'text-[#8b5cf6]' },
    avi: { icon: FileVideo, color: 'text-[#8b5cf6]' },
    mkv: { icon: FileVideo, color: 'text-[#8b5cf6]' },
    webm: { icon: FileVideo, color: 'text-[#8b5cf6]' },

    // Audio
    mp3: { icon: FileAudio, color: 'text-[#10b981]' },
    wav: { icon: FileAudio, color: 'text-[#10b981]' },
    flac: { icon: FileAudio, color: 'text-[#10b981]' },
    aac: { icon: FileAudio, color: 'text-[#10b981]' },
    ogg: { icon: FileAudio, color: 'text-[#10b981]' },

    // Documents
    pdf: { icon: FileType, color: 'text-[#ef4444]' },
    doc: { icon: FileText, color: 'text-[#3b82f6]' },
    docx: { icon: FileText, color: 'text-[#3b82f6]' },
    txt: { icon: FileText, color: 'text-[#64748b]' },
    rtf: { icon: FileText, color: 'text-[#64748b]' },
    md: { icon: FileText, color: 'text-[#64748b]' },

    // Spreadsheets
    xls: { icon: FileSpreadsheet, color: 'text-[#059669]' },
    xlsx: { icon: FileSpreadsheet, color: 'text-[#059669]' },
    csv: { icon: FileSpreadsheet, color: 'text-[#059669]' },

    // Presentations
    ppt: { icon: Presentation, color: 'text-[#f59e0b]' },
    pptx: { icon: Presentation, color: 'text-[#f59e0b]' },
    key: { icon: Presentation, color: 'text-[#f59e0b]' },

    // Archives
    zip: { icon: FileArchive, color: 'text-[#d97706]' },
    rar: { icon: FileArchive, color: 'text-[#d97706]' },
    '7z': { icon: FileArchive, color: 'text-[#d97706]' },
    tar: { icon: FileArchive, color: 'text-[#d97706]' },
    gz: { icon: FileArchive, color: 'text-[#d97706]' },

    // Code
    js: { icon: FileCode, color: 'text-[#eab308]' },
    ts: { icon: FileCode, color: 'text-[#3b82f6]' },
    jsx: { icon: FileCode, color: 'text-[#06b6d4]' },
    tsx: { icon: FileCode, color: 'text-[#06b6d4]' },
    py: { icon: FileCode, color: 'text-[#10b981]' },
    rs: { icon: FileCode, color: 'text-[#f97316]' },
    go: { icon: FileCode, color: 'text-[#22d3ee]' },
    java: { icon: FileCode, color: 'text-[#ef4444]' },
    html: { icon: FileCode, color: 'text-[#f97316]' },
    css: { icon: FileCode, color: 'text-[#3b82f6]' },
    json: { icon: FileCode, color: 'text-[#facc15]' },
};

export function getFileTypeInfo(filename: string): { icon: typeof File; color: string } {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return extensionMap[ext] || { icon: File, color: 'text-telegram-subtext' };
}

interface FileTypeIconProps {
    filename: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

export function FileTypeIcon({ filename, className, size = 'md' }: FileTypeIconProps) {
    const { icon: Icon, color } = getFileTypeInfo(filename);
    const sizeClass = className ?? sizeMap[size];
    return <Icon className={`${sizeClass} ${color} pointer-events-none select-none`} />;
}
