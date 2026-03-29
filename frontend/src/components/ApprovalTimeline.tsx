import type { ApprovalRequest } from '../types';
import { CheckCircle2, XCircle, Clock, User } from 'lucide-react';

interface Props {
  approvals: ApprovalRequest[];
}

export default function ApprovalTimeline({ approvals }: Props) {
  if (!approvals.length) {
    return (
      <div className="text-center py-6 text-surface-400 text-sm">
        No approval history yet
      </div>
    );
  }

  const sorted = [...approvals].sort((a, b) => a.stepOrder - b.stepOrder);

  const getIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <Clock className="w-5 h-5 text-warning-500 animate-pulse-soft" />;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-success-500';
      case 'rejected':
        return 'border-danger-500';
      default:
        return 'border-warning-400';
    }
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-50';
      case 'rejected':
        return 'bg-danger-50';
      default:
        return 'bg-warning-50';
    }
  };

  return (
    <div className="space-y-0">
      {sorted.map((ar, i) => (
        <div key={ar.id} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full border-2 ${getBorderColor(ar.status)} ${getBgColor(ar.status)} flex items-center justify-center z-10`}>
              {getIcon(ar.status)}
            </div>
            {i < sorted.length - 1 && (
              <div className={`w-0.5 h-full min-h-[40px] ${ar.status !== 'pending' ? 'bg-surface-200' : 'bg-surface-100 border-l border-dashed border-surface-300'}`} />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-surface-400" />
              <span className="text-sm font-semibold text-surface-800">
                {ar.approver?.name || 'Approver'}
              </span>
              <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                ar.status === 'approved' ? 'bg-success-50 text-success-600'
                : ar.status === 'rejected' ? 'bg-danger-50 text-danger-600'
                : 'bg-warning-50 text-warning-600'
              }`}>
                {ar.status}
              </span>
            </div>
            <p className="text-xs text-surface-400 mb-1">
              Step {ar.stepOrder}
              {ar.decidedAt && ` · ${new Date(ar.decidedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${new Date(ar.decidedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
            {ar.comment && (
              <p className="text-sm text-surface-600 bg-surface-50 rounded-lg px-3 py-2 mt-1 italic">
                "{ar.comment}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
