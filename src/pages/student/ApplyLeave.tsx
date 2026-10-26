import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { LeaveRequest } from '../../types';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { CalendarPlus, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const list = await api.leaves.list();
      setLeaves(list.filter((l) => l.studentId === user?.id || l.studentId === 'user-student-1'));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please specify start date, end date, and reason');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      await api.leaves.create({
        studentId: user.id,
        startDate,
        endDate,
        reason,
        documentName: fileName || 'Proof_Document.pdf',
      });
      toast.success('Leave application submitted to Department Head.');
      setStartDate('');
      setEndDate('');
      setReason('');
      setFileName('');
      await fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'dates',
      header: 'Duration',
      accessor: (l) => (
        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
          {l.startDate} → {l.endDate}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: (l) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">
          {l.reason}
        </span>
      ),
    },
    {
      key: 'documentName',
      header: 'Attachment',
      accessor: (l) =>
        l.documentName ? (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-sky-600 dark:text-sky-400">
            <FileText className="w-3 h-3" />
            {l.documentName}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (l) => <StatusBadge status={l.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'reviewedBy',
      header: 'Reviewer',
      accessor: (l) => (
        <span className="text-xs text-slate-500">
          {l.reviewedBy ? `${l.reviewedBy} (${l.reviewerRemarks || 'Noted'})` : 'Awaiting review'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Leave Applications & Excused Absences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Apply for medical, academic conference, or emergency excused absences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            New Leave Application
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Reason
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the academic or medical justification..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supporting Certificate (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="leave-file-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
                  }}
                />
                <label
                  htmlFor="leave-file-input"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </label>
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                  {fileName || 'No file chosen'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application (POST /leaves)'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={leaves}
            isLoading={isLoading}
            searchPlaceholder="Filter leave requests..."
          />
        </div>
      </div>
    </div>
  );
};
