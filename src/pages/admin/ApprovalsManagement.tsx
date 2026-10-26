import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { LeaveRequest, AttendanceCorrectionRequest } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Check, X, FileText, CalendarCheck, AlertCircle } from 'lucide-react';

export const ApprovalsManagement: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'LEAVES' | 'CORRECTIONS'>('LEAVES');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueues = async () => {
    setIsLoading(true);
    try {
      const [lvs, corrs] = await Promise.all([
        api.leaves.list(),
        api.corrections.listPending(),
      ]);
      setLeaves(lvs);
      setCorrections(corrs);
    } catch {
      toast.error('Failed to load approval queues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleLeaveDecision = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await api.leaves.approve(id, 'Academic Dean', 'Approved with medical/event waiver');
        toast.success('Leave request approved.');
      } else {
        await api.leaves.reject(id, 'Academic Dean', 'Disallowed per policy');
        toast.info('Leave request rejected.');
      }
      await fetchQueues();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleCorrectionDecision = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await api.corrections.approve(id, 'Academic Dean', 'Administrative override');
        toast.success('Correction request approved and ledger updated.');
      } else {
        await api.corrections.reject(id, 'Academic Dean', 'Insufficient proof');
        toast.info('Correction rejected.');
      }
      await fetchQueues();
    } catch {
      toast.error('Operation failed');
    }
  };

  const leaveColumns: Column<LeaveRequest>[] = [
    {
      key: 'studentName',
      header: 'Student',
      accessor: (l) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{l.studentName}</p>
          <span className="font-mono text-[11px] text-slate-400">{l.studentRoll}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'dates',
      header: 'Absence Period',
      accessor: (l) => <span className="font-mono text-xs">{l.startDate} → {l.endDate}</span>,
      sortable: true,
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: (l) => <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">{l.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (l) => <StatusBadge status={l.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      accessor: (l) =>
        l.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleLeaveDecision(l.id, false)}
              className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
            >
              Reject
            </button>
            <button
              onClick={() => handleLeaveDecision(l.id, true)}
              className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Approve
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Reviewed by {l.reviewedBy}</span>
        ),
    },
  ];

  const correctionColumns: Column<AttendanceCorrectionRequest>[] = [
    {
      key: 'studentName',
      header: 'Student',
      accessor: (c) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{c.studentName}</p>
          <span className="font-mono text-[11px] text-slate-400">{c.studentRoll}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'subjectName',
      header: 'Subject & Date',
      accessor: (c) => (
        <div>
          <p className="font-semibold text-xs">{c.subjectName}</p>
          <span className="font-mono text-[11px] text-slate-400">{c.sessionDate}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'correction',
      header: 'Dispute',
      accessor: (c) => (
        <span className="font-mono text-xs">
          <span className="text-rose-500 font-bold">{c.currentStatus}</span> → <span className="text-emerald-500 font-bold">{c.requestedStatus}</span>
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: (c) => <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">{c.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (c) => <StatusBadge status={c.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      accessor: (c) =>
        c.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleCorrectionDecision(c.id, false)}
              className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
            >
              Reject
            </button>
            <button
              onClick={() => handleCorrectionDecision(c.id, true)}
              className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
            >
              Approve
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Reviewed by {c.reviewedBy}</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Approvals & Dispute Review Queues
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review formal leave applications and student attendance correction petitions.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('LEAVES')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'LEAVES'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Leave Requests ({leaves.filter((l) => l.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CORRECTIONS')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'CORRECTIONS'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Correction Petitions ({corrections.filter((c) => c.status === 'PENDING').length})</span>
        </button>
      </div>

      {activeTab === 'LEAVES' ? (
        <DataTable
          columns={leaveColumns}
          data={leaves}
          isLoading={isLoading}
          searchPlaceholder="Search leaves by student name, roll no, or date..."
        />
      ) : (
        <DataTable
          columns={correctionColumns}
          data={corrections}
          isLoading={isLoading}
          searchPlaceholder="Search correction petitions..."
        />
      )}
    </div>
  );
};
