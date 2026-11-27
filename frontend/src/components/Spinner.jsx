import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-600">
      <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
