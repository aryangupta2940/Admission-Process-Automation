import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const STYLES = {
  error: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-800',
    Icon: AlertCircle,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-800',
    Icon: AlertTriangle,
  },
  info: {
    wrap: 'border-blue-200 bg-blue-50 text-blue-800',
    Icon: Info,
  },
};

export default function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null;
  const { wrap, Icon } = STYLES[type] || STYLES.info;

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${wrap}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
