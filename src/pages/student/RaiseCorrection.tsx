import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { AttendanceCorrectionRequest, AttendanceRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const RaiseCorrection: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [sessionDate, setSessionDate] = useState('2026-10-23');
  const [subjectName, setSubjectName] = useState('Distributed Operating Systems (CS401)');
  const [currentStatus, setCurrentStatus] = useState<'ABSENT' | 'LATE'>('ABSENT');
  const [requestedStatus, setRequestedStatus] = useState<'PRESENT'>('PRESENT');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCorrections = async () => {
    try {
      const list = await api.corrections.listPending();
      setCorrections(list.filter((c) => c.studentId === user?.id || c.studentId === 'user-student-1'));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please describe why the record was marked inaccurately.');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      await api.corrections.create({
        attendanceId: `att-claim-${Date.now()}`,
        sessionId: 'sess-prev-1',
        studentId: user.id,
        sessionDate,
        subjectName,
        currentStatus,
        requestedStatus,
        reason,
      });
      toast.success('Dispute ticket raised. Forwarded to the course professor.');
      setReason('');
      await fetchCorrections();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<AttendanceCorrectionRequest>[] = [
    {
      key: 'sessionDate',
      header: 'Session & Date',
      accessor: (c) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">
            {c.subjectName}
          </p>
          <span className="font-mono text-[11px] text-slate-400">
            {c.sessionDate}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'change',
      header: 'Correction',
      accessor: (c) => (
        <span className="text-xs font-mono">
          <span className="text-rose-500 font-bold">{c.currentStatus}</span> →{' '}
          <span className="text-emerald-500 font-bold">{c.requestedStatus}</span>
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Student Statement',
      accessor: (c) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-1 max-w-xs">
          "{c.reason}"
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      accessor: (c) => <StatusBadge status={c.status} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Raise Attendance Correction Request
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Dispute an accidental absence or camera sweep glitch with your course instructor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Dispute Record Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Disputed Course
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              >
                <option value="Distributed Operating Systems (CS401)">CS401 - Distributed OS</option>
                <option value="Deep Learning & Computer Vision (CS402)">CS402 - Deep Learning</option>
                <option value="Cloud Infrastructure & DevOps (CS403)">CS403 - Cloud Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Date
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recorded As
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                >
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Requested As
                </label>
                <input
                  type="text"
                  disabled
                  value="PRESENT"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason & Context
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what happened (e.g. camera obstruction, verbal verification, transit delay)..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute (POST /corrections)'}
            </button>
          </form>
        </div>

        {/* Status Table */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={corrections}
            isLoading={isLoading}
            searchPlaceholder="Filter past corrections..."
          />
        </div>
      </div>
    </div>
  );
};
