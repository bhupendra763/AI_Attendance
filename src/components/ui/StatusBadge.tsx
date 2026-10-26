import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AttendanceStatus, SessionStatus, LeaveStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | SessionStatus | LeaveStatus | 'ACTIVE' | 'LOCKED' | 'ONLINE' | 'OFFLINE' | 'SAFE' | 'WARNING' | 'CRITICAL' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = String(status).toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let icon = null;
  let label = norm;

  switch (norm) {
    case 'PRESENT':
    case 'APPROVED':
    case 'ACTIVE':
    case 'ONLINE':
    case 'SAFE':
    case 'PASSED':
      styles = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      label = norm === 'SAFE' ? 'Safe (≥75%)' : norm === 'ACTIVE' ? 'Active' : norm === 'ONLINE' ? 'Online' : 'Present';
      break;

    case 'ABSENT':
    case 'REJECTED':
    case 'CANCELLED':
    case 'LOCKED':
    case 'OFFLINE':
    case 'CRITICAL':
    case 'FAILED':
      styles = 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      icon = <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />;
      label = norm === 'CRITICAL' ? 'Critical (<65%)' : norm === 'LOCKED' ? 'Locked' : norm === 'OFFLINE' ? 'Offline' : norm === 'ABSENT' ? 'Absent' : 'Rejected';
      break;

    case 'LATE':
    case 'WARNING':
    case 'SPOOF_SUSPECTED':
      styles = 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      icon = <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />;
      label = norm === 'WARNING' ? 'Warning (<75%)' : norm === 'SPOOF_SUSPECTED' ? 'Spoof Suspected' : 'Late';
      break;

    case 'OPEN':
      styles = 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
      icon = <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0 animate-pulse" />;
      label = 'Session Open';
      break;

    case 'SCHEDULED':
    case 'PENDING':
    case 'EXCUSED':
      styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      icon = <Clock className="w-3 h-3 text-slate-500 shrink-0" />;
      label = norm === 'PENDING' ? 'Pending Review' : norm === 'EXCUSED' ? 'Excused' : 'Scheduled';
      break;

    case 'CLOSED':
      styles = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      label = 'Closed';
      break;

    default:
      label = norm;
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px] gap-1' : 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md whitespace-nowrap select-none ${styles} ${sizeClasses}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
