import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
    onSelectAll: () => void;
    onDelete: () => void;
    onEscape: () => void;
    onSearch: () => void;
    onEnter?: () => void;
    onActivity?: () => void;
    onCommandPalette?: () => void;
    onToggleTheme?: () => void;
    onToggleCompact?: () => void;
    onFontIncrease?: () => void;
    onFontDecrease?: () => void;
    enabled?: boolean;
}

export function useKeyboardShortcuts({
    onSelectAll, onDelete, onEscape, onSearch, onEnter, onActivity,
    onCommandPalette, onToggleTheme, onToggleCompact,
    onFontIncrease, onFontDecrease,
    enabled = true
}: UseKeyboardShortcutsProps) {

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Only allow Escape in inputs
            if (e.key === 'Escape') {
                (target as HTMLInputElement).blur();
                onEscape();
            }
            return;
        }

        const isMod = e.metaKey || e.ctrlKey;

        // Cmd/Ctrl + A - Select All
        if (isMod && e.key === 'a') {
            e.preventDefault();
            onSelectAll();
            return;
        }

        // Cmd/Ctrl + F - Focus Search
        if (isMod && e.key === 'f') {
            e.preventDefault();
            onSearch();
            return;
        }

        // Delete / Backspace - Delete selected
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            onDelete();
            return;
        }

        // Escape - Clear selection
        if (e.key === 'Escape') {
            e.preventDefault();
            onEscape();
            return;
        }
        // Enter - Open / Preview
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnter?.();
            return;
        }

        // Cmd/Ctrl + K - Command Palette
        if (isMod && e.key === 'k') {
            e.preventDefault();
            onCommandPalette?.();
            return;
        }

        // Cmd/Ctrl + Shift + C - Compact Mode
        if (isMod && e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            onToggleCompact?.();
            return;
        }

        // T - Toggle Theme
        if (e.key.toLowerCase() === 't' && !isMod) {
            e.preventDefault();
            onToggleTheme?.();
            return;
        }

        // A - Activity Center
        if (e.key.toLowerCase() === 'a' && !isMod) {
            e.preventDefault();
            onActivity?.();
            return;
        }

        // Cmd/Ctrl + = - Increase Font
        if (isMod && (e.key === '=' || e.key === '+')) {
            e.preventDefault();
            onFontIncrease?.();
            return;
        }

        // Cmd/Ctrl + - - Decrease Font
        if (isMod && e.key === '-') {
            e.preventDefault();
            onFontDecrease?.();
            return;
        }
    }, [enabled, onSelectAll, onDelete, onEscape, onSearch, onEnter, onActivity, onCommandPalette, onToggleTheme, onToggleCompact, onFontIncrease, onFontDecrease]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
