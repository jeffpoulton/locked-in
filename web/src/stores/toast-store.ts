import { create } from "zustand";

/**
 * Toast notification type variants.
 */
export type ToastVariant = "success" | "error";

/**
 * Toast notification state.
 */
interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

/**
 * Toast store state and actions.
 */
interface ToastState {
  /** Currently displayed toast, if any */
  toast: Toast | null;
  /** Show a toast notification */
  showToast: (message: string, variant: ToastVariant) => void;
  /** Dismiss the current toast */
  dismissToast: () => void;
}

/**
 * Generate a unique ID for toast notifications.
 */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Zustand store for managing toast notifications.
 *
 * Features:
 * - Single toast at a time (new toasts replace existing ones)
 * - Support for success and error variants
 * - Auto-dismiss functionality (handled by component)
 */
export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  showToast: (message: string, variant: ToastVariant) => {
    const id = generateToastId();
    set({ toast: { id, message, variant } });
  },

  dismissToast: () => {
    set({ toast: null });
  },
}));
