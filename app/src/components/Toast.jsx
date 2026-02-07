import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const iconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const colorMap = {
    success: 'bg-primary-50 border-primary-200 text-primary-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800',
};

const iconColorMap = {
    success: 'text-primary-500',
    error: 'text-rose-500',
    info: 'text-sky-500',
};

export default function Toast() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => {
                const Icon = iconMap[toast.type] || Info;
                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md animate-slide-down ${colorMap[toast.type] || colorMap.info}`}
                    >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[toast.type] || iconColorMap.info}`} />
                        <p className="flex-1 text-sm font-bold">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-lg transition-all flex-shrink-0"
                        >
                            <X className="w-4 h-4 opacity-40" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
