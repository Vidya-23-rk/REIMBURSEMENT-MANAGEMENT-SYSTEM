import type { ExpenseStatus } from '../types';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  status: ExpenseStatus;
  size?: 'sm' | 'md';
}

const config: Record<ExpenseStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    className: 'badge-pending',
    icon: <Clock className="w-3 h-3" />,
  },
  in_progress: {
    label: 'In Progress',
    className: 'badge-in-progress',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  approved: {
    label: 'Approved',
    className: 'badge-approved',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    className: 'badge-rejected',
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const c = config[status];
  return (
    <span className={`${c.className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {c.icon}
      {c.label}
    </span>
  );
}
