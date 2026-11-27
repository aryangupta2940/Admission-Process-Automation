import { CheckCircle2, Clock, Eye, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  Pending: {
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    Icon: Clock,
  },
  'Under Review': {
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
    Icon: Eye,
  },
  Approved: {
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Icon: CheckCircle2,
  },
  Rejected: {
    classes: 'bg-rose-50 text-rose-800 border-rose-200',
    Icon: XCircle,
  },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
