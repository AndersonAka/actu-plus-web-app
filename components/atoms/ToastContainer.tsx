'use client';

import { Toast, ToastProps } from './Toast';

export interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end justify-start gap-3 p-4 sm:p-6">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

export { ToastContainer };
