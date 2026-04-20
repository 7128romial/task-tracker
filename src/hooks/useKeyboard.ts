import { useEffect } from 'react';
import { VIEW } from '@/constants/task';
import type { ViewMode } from '@/types/task';

interface Handlers {
  onNewTask: () => void;
  onFocusSearch: () => void;
  onSetView: (view: ViewMode) => void;
  onOpenPalette: () => void;
  modalOpen: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onSetView,
  onOpenPalette,
  modalOpen,
}: Handlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K works even when modal is open or focus is in an input
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenPalette();
        return;
      }

      if (modalOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          onNewTask();
          break;
        case '/':
          e.preventDefault();
          onFocusSearch();
          break;
        case '1':
          e.preventDefault();
          onSetView(VIEW.TABLE);
          break;
        case '2':
          e.preventDefault();
          onSetView(VIEW.KANBAN);
          break;
        case '3':
          e.preventDefault();
          onSetView(VIEW.TIMELINE);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewTask, onFocusSearch, onSetView, onOpenPalette, modalOpen]);
}
