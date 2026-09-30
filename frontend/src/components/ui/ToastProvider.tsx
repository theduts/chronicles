import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      duration={5000}
      toastOptions={{
        className: 'rounded-none border font-sans text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl p-4',
        classNames: {
          success: 'bg-[#1b4332] text-[#d8f3dc] border-[#52b788]',
          error: 'bg-[#591e1e] text-primary border-primary',
          warning: 'bg-[#3e2723] text-[#ffe082] border-[#ffe082]',
          info: 'bg-surface-container text-on-surface border-outline-variant',
          closeButton: 'text-on-surface/70 hover:text-on-surface border border-white/20 hover:border-white/40 rounded-none text-xs font-bold uppercase',
        },
      }}
      closeButton
    />
  );
}
