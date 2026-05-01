import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FileCard } from './FileCard';
import { EmptyState } from './EmptyState';
import { TelegramFile } from '../../types';
import { ContextMenu } from './ContextMenu';
import { FileListItem } from './FileListItem';

type SortField = 'name' | 'size' | 'date';
type SortDirection = 'asc' | 'desc';

interface FileExplorerProps {
    files: TelegramFile[];
    loading: boolean;
    error: Error | null;
    viewMode: 'grid' | 'list';
    selectedIds: number[];
    activeFolderId: number | null;
    onFileClick: (e: React.MouseEvent, id: number) => void;
    onDelete: (id: number) => void;
    onDownload: (id: number, name: string) => void;
    onPreview: (file: TelegramFile, orderedFiles?: TelegramFile[]) => void;
    onManualUpload: () => void;
    onSelectionClear: () => void;
    onDrop?: (e: React.DragEvent, folderId: number) => void;
    onDragStart?: (fileId: number) => void;
    onDragEnd?: () => void;
    onBulkSelect?: (ids: number[]) => void;
    onColorChange?: (folderId: number, color: string) => void;
}


function useGridColumns(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [columns, setColumns] = useState(4);
    const [containerWidth, setContainerWidth] = useState(800);

    useEffect(() => {
        if (!containerRef.current) return;

        const updateColumns = () => {
            const width = containerRef.current?.clientWidth || 800;
            setContainerWidth(width);
            if (width < 640) setColumns(2);
            else if (width < 768) setColumns(3);
            else if (width < 1024) setColumns(4);
            else if (width < 1280) setColumns(5);
            else setColumns(6);
        };

        updateColumns();
        const observer = new ResizeObserver(updateColumns);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef]);

    return { columns, containerWidth };
}

export function FileExplorer({
    files, loading, error, viewMode, selectedIds, activeFolderId,
    onFileClick, onDelete, onDownload, onPreview, onManualUpload, onSelectionClear, onDrop, onDragStart, onDragEnd, onBulkSelect, onColorChange
}: FileExplorerProps) {
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: TelegramFile } | null>(null);
    const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const parentRef = useRef<HTMLDivElement>(null);
    const { columns, containerWidth } = useGridColumns(parentRef);

    const GAP = 6;
    const cardWidth = (containerWidth - (GAP * (columns - 1))) / columns;
    const cardHeight = cardWidth * 0.75; // aspect-[4/3]
    const rowHeight = Math.max(cardHeight + GAP, 150);

    const handleContextMenu = useCallback((e: React.MouseEvent, file: TelegramFile) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    }, []);

    const sortedFiles = useMemo(() => {
        return [...files].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0);
                    break;
                case 'date':
                    comparison = (a.created_at || '').localeCompare(b.created_at || '');
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [files, sortField, sortDirection]);

    const handlePreviewRequest = useCallback((file: TelegramFile) => {
        onPreview(file, sortedFiles);
    }, [onPreview, sortedFiles]);


    const gridRows = useMemo(() => {
        const rows: (TelegramFile | 'upload')[][] = [];
        const itemsWithUpload: (TelegramFile | 'upload')[] = [...sortedFiles, 'upload'];
        for (let i = 0; i < itemsWithUpload.length; i += columns) {
            rows.push(itemsWithUpload.slice(i, i + columns));
        }
        return rows;
    }, [sortedFiles, columns]);


    const listItems = useMemo(() => {
        return activeFolderId === null ? [...sortedFiles, 'upload' as const] : sortedFiles;
    }, [sortedFiles, activeFolderId]);


    const gridVirtualizer = useVirtualizer({
        count: gridRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: useCallback(() => rowHeight, [rowHeight]),
        overscan: 2,
        gap: GAP,
    });


    useEffect(() => {
        gridVirtualizer.measure();
    }, [rowHeight, gridVirtualizer]);

    const listVirtualizer = useVirtualizer({
        count: listItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 5,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (files.length === 0 || loading) return;

            // Don't navigate if user is typing in search or other inputs
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const currentIndex = selectedIds.length === 1 
                ? sortedFiles.findIndex(f => f.id === selectedIds[0]) 
                : -1;

            let nextIndex = -1;

            switch (e.key) {
                case 'ArrowRight':
                    nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, sortedFiles.length - 1);
                    break;
                case 'ArrowLeft':
                    nextIndex = currentIndex === -1 ? sortedFiles.length - 1 : Math.max(currentIndex - 1, 0);
                    break;
                case 'ArrowDown':
                    if (viewMode === 'grid') {
                        nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + columns, sortedFiles.length - 1);
                    } else {
                        nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, sortedFiles.length - 1);
                    }
                    break;
                case 'ArrowUp':
                    if (viewMode === 'grid') {
                        nextIndex = currentIndex === -1 ? sortedFiles.length - 1 : Math.max(currentIndex - columns, 0);
                    } else {
                        nextIndex = currentIndex === -1 ? sortedFiles.length - 1 : Math.max(currentIndex - 1, 0);
                    }
                    break;
                default:
                    return;
            }

            if (nextIndex !== -1) {
                e.preventDefault();
                const nextFile = sortedFiles[nextIndex];
                if (nextFile) {
                    onFileClick({ shiftKey: e.shiftKey, metaKey: e.metaKey || e.ctrlKey, stopPropagation: () => {} } as any, nextFile.id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [files, sortedFiles, selectedIds, viewMode, columns, loading, onFileClick]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target !== parentRef.current || viewMode !== 'grid') return;
        
        const rect = parentRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + parentRef.current.scrollLeft;
        const y = e.clientY - rect.top + parentRef.current.scrollTop;
        
        setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
        setIsSelecting(true);
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) onSelectionClear();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selectionBox || !parentRef.current) return;
        
        const rect = parentRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + parentRef.current.scrollLeft;
        const y = e.clientY - rect.top + parentRef.current.scrollTop;
        
        setSelectionBox(prev => prev ? { ...prev, x2: x, y2: y } : null);
        
        // Selection logic
        const xMin = Math.min(selectionBox.x1, x);
        const xMax = Math.max(selectionBox.x1, x);
        const yMin = Math.min(selectionBox.y1, y);
        const yMax = Math.max(selectionBox.y1, y);
        
        const newlySelected: number[] = [];
        
        // This is a bit complex with virtualization, but we can check visible items
        // and ideally items that overlap the rect.
        // For simplicity, we'll iterate through sortedFiles and estimate their positions
        sortedFiles.forEach((file, index) => {
            const rowIndex = Math.floor(index / columns);
            const colIndex = index % columns;
            
            const fileX = colIndex * (cardWidth + GAP);
            const fileY = rowIndex * (cardHeight + GAP);
            
            if (fileX < xMax && fileX + cardWidth > xMin &&
                fileY < yMax && fileY + cardHeight > yMin) {
                newlySelected.push(file.id);
            }
        });
        
        if (newlySelected.length > 0 && onBulkSelect) {
            // Update selection without clearing existing if shift/cmd is held
            const baseSelection = (e.shiftKey || e.metaKey || e.ctrlKey) ? selectedIds : [];
            const uniqueSelected = Array.from(new Set([...baseSelection, ...newlySelected]));
            onBulkSelect(uniqueSelected);
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setSelectionBox(null);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="w-3 h-3 text-telegram-primary" />
            : <ArrowDown className="w-3 h-3 text-telegram-primary" />;
    };

    if (loading) {
        return (
            <div className="flex-1 p-6 flex justify-center items-center text-telegram-subtext flex-col gap-4">
                <div className="w-8 h-8 border-4 border-telegram-primary border-t-transparent rounded-full animate-spin"></div>
                Loading your files...
            </div>
        )
    }

    if (error) {
        return <div className="flex-1 p-6 flex justify-center items-center text-red-400">Error loading files</div>
    }

    if (files.length === 0) {
        return (
            <div className="flex-1 p-6 overflow-auto">
                <EmptyState onUpload={onManualUpload} />
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className="flex-1 p-6 overflow-auto custom-scrollbar relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={(e) => {
                if (e.target === e.currentTarget) onSelectionClear();
            }}
        >
            {isSelecting && selectionBox && (
                <div 
                    className="absolute z-[100] border border-telegram-primary bg-telegram-primary/20 pointer-events-none"
                    style={{
                        left: Math.min(selectionBox.x1, selectionBox.x2),
                        top: Math.min(selectionBox.y1, selectionBox.y2),
                        width: Math.abs(selectionBox.x2 - selectionBox.x1),
                        height: Math.abs(selectionBox.y2 - selectionBox.y1),
                    }}
                />
            )}
            {viewMode === 'grid' ? (
                <>

                    <div className="flex items-center gap-2 mb-6 text-xs font-medium text-telegram-subtext">
                        <span className="mr-2">Sort by:</span>
                        <button
                            onClick={() => handleSort('name')}
                            className={`px-3 py-1.5 rounded-lg border transition-all ${sortField === 'name' ? 'bg-telegram-primary text-white border-telegram-primary shadow-sm' : 'border-telegram-border bg-white hover:bg-telegram-hover'}`}
                        >
                            Name
                        </button>
                        <button
                            onClick={() => handleSort('size')}
                            className={`px-3 py-1.5 rounded-lg border transition-all ${sortField === 'size' ? 'bg-telegram-primary text-white border-telegram-primary shadow-sm' : 'border-telegram-border bg-white hover:bg-telegram-hover'}`}
                        >
                            Size
                        </button>
                        <button
                            onClick={() => handleSort('date')}
                            className={`px-3 py-1.5 rounded-lg border transition-all ${sortField === 'date' ? 'bg-telegram-primary text-white border-telegram-primary shadow-sm' : 'border-telegram-border bg-white hover:bg-telegram-hover'}`}
                        >
                            Date
                        </button>
                    </div>


                    <div
                        className="relative w-full"
                        style={{ height: `${gridVirtualizer.getTotalSize()}px` }}
                    >
                        {gridVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = gridRows[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    className="absolute top-0 left-0 w-full grid"
                                    style={{
                                        height: `${cardHeight}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                        gap: `${GAP}px`,
                                    }}
                                >
                                    {row.map((item) => {
                                        if (item === 'upload') {
                                            return (
                                                <button
                                                    key="upload"
                                                    onClick={(e) => { e.stopPropagation(); onManualUpload(); }}
                                                    className="border-2 border-dashed border-telegram-border rounded-xl flex flex-col items-center justify-center text-telegram-subtext hover:border-telegram-primary hover:text-telegram-primary transition-all group"
                                                    style={{ height: `${cardHeight}px` }}
                                                >
                                                    <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-medium">Upload File</span>
                                                </button>
                                            );
                                        }
                                        const file = item;
                                        return (
                                            <FileCard
                                                key={file.id}
                                                file={file}
                                                isSelected={selectedIds.includes(file.id)}
                                                onClick={(e) => onFileClick(e, file.id)}
                                                onContextMenu={(e) => handleContextMenu(e, file)}
                                                onDelete={() => onDelete(file.id)}
                                                onDownload={() => onDownload(file.id, file.name)}
                                                onPreview={() => handlePreviewRequest(file)}
                                                onDrop={onDrop}
                                                onDragStart={onDragStart}
                                                onDragEnd={onDragEnd}
                                                activeFolderId={activeFolderId}
                                                height={cardHeight}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col w-full">
                    {/* List Header */}
                    <div className="grid grid-cols-[2rem_2fr_6rem_8rem] gap-4 px-4 py-2 text-xs font-semibold text-telegram-subtext border-b border-telegram-border mb-2 select-none items-center">
                        <div className="text-center">#</div>
                        <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-telegram-text transition-colors">
                            Name <SortIcon field="name" />
                        </button>
                        <button onClick={() => handleSort('size')} className="flex items-center gap-1 justify-end hover:text-telegram-text transition-colors">
                            Size <SortIcon field="size" />
                        </button>
                        <button onClick={() => handleSort('date')} className="flex items-center gap-1 justify-end hover:text-telegram-text transition-colors">
                            Date <SortIcon field="date" />
                        </button>
                    </div>


                    <div
                        className="relative w-full"
                        style={{ height: `${listVirtualizer.getTotalSize()}px` }}
                    >
                        {listVirtualizer.getVirtualItems().map((virtualItem) => {
                            const item = listItems[virtualItem.index];
                            if (item === 'upload') {
                                return (
                                    <div
                                        key="upload"
                                        className="absolute top-0 left-0 w-full"
                                        style={{ transform: `translateY(${virtualItem.start}px)` }}
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onManualUpload(); }}
                                            className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer border border-dashed border-telegram-border text-telegram-subtext hover:text-telegram-text hover:bg-telegram-hover w-full"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                            <span className="text-sm font-medium">Upload File...</span>
                                        </button>
                                    </div>
                                );
                            }
                            const file = item;
                            return (
                                <div
                                    key={file.id}
                                    className="absolute top-0 left-0 w-full"
                                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                                >
                                    <FileListItem
                                        file={file}
                                        selectedIds={selectedIds}
                                        onFileClick={onFileClick}
                                        handleContextMenu={handleContextMenu}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onDrop={onDrop}
                                        onPreview={handlePreviewRequest}
                                        onDownload={onDownload}
                                        onDelete={onDelete}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    file={contextMenu.file}
                    onClose={() => setContextMenu(null)}
                    onDownload={() => {
                        onDownload(contextMenu.file.id, contextMenu.file.name);
                        setContextMenu(null);
                    }}
                    onDelete={() => {
                        onDelete(contextMenu.file.id);
                        setContextMenu(null);
                    }}
                    onPreview={() => {
                        if (contextMenu.file.type === 'folder') {
                            onFileClick({ preventDefault: () => { }, stopPropagation: () => { } } as React.MouseEvent, contextMenu.file.id);
                        } else {
                            handlePreviewRequest(contextMenu.file);
                        }
                        setContextMenu(null);
                    }}
                    onColorChange={(color) => onColorChange?.(contextMenu.file.id, color)}
                />
            )}
        </div>
    )
}
