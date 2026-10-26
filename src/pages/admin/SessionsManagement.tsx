import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { Session } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  CalendarPlus,
  Clock,
  MapPin,
  Users,
  PlayCircle,
  XCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const SessionsManagement: React.FC = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate sessions modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [isGenerating, setIsGenerating] = useState(false);

  // Cancel session confirm
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const list = await api.sessions.list();
      setSessions(list);
    } catch {
      toast.error('Failed to load academic sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.sessions.generate(startDate, endDate);
      toast.success(res.message || 'Academic sessions generated.');
      setIsGenerateOpen(false);
      await fetchSessions();
    } catch {
      toast.error('Batch session generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelSession = async () => {
    if (!cancelId) return;
    try {
      await api.sessions.cancel(cancelId);
      toast.info('Session cancelled.');
      setCancelId(null);
      await fetchSessions();
    } catch {
      toast.error('Cancel failed');
    }
  };

  const handleOpenSession = async (id: string) => {
    try {
      await api.sessions.open(id);
      toast.success('Session opened for live attendance.');
      await fetchSessions();
    } catch {
      toast.error('Could not open session');
    }
  };

  const columns: Column<Session>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      accessor: (s) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white font-mono">{s.date}</p>
          <span className="text-[11px] text-slate-400 font-mono">
            {s.startTime} - {s.endTime}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'subjectCode',
      header: 'Course & Section',
      accessor: (s) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">
            {s.subjectCode} · {s.subjectName}
          </p>
          <span className="text-[11px] text-slate-400">
            Section: {s.sectionName} · Room: {s.roomCode}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'teacherName',
      header: 'Instructor',
      accessor: (s) => <span className="text-xs">{s.teacherName}</span>,
      sortable: true,
    },
    {
      key: 'attendanceMode',
      header: 'Mode',
      accessor: (s) => (
        <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
          {s.attendanceMode || 'FACE'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (s) => <StatusBadge status={s.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'attendanceSummary',
      header: 'Turnout',
      accessor: (s) => (
        <span className="font-mono text-xs tabular-nums">
          <span className="text-emerald-600 font-bold">{s.presentCount}</span> /{' '}
          <span className="text-slate-400">{s.totalStudents}</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      accessor: (s) => (
        <div className="flex items-center justify-end gap-2">
          {s.status === 'SCHEDULED' && (
            <button
              onClick={() => handleOpenSession(s.id)}
              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Open
            </button>
          )}
          {s.status !== 'CANCELLED' && s.status !== 'CLOSED' && (
            <button
              onClick={() => setCancelId(s.id)}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Attendance Sessions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate calendar instances from weekly timetable grids and administer attendance windows.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Batch Generate Sessions</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        isLoading={isLoading}
        searchPlaceholder="Filter sessions by course, section, or room..."
      />

      {/* Generate Dialog */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Academic Sessions"
        description="Creates scheduled attendance registers for all timetable slots within the chosen date range."
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              />
            </div>
          </div>

          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-md border border-sky-100 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300">
            Recognized holidays (Mid-Semester Break, etc.) will be automatically skipped according to master records.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsGenerateOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              {isGenerating ? 'Generating...' : 'Run Generation Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancelSession}
        title="Cancel Session"
        message="Are you sure you want to cancel this class session? Attendance will not be recorded for students enrolled in this offering."
        isDestructive={true}
      />
    </div>
  );
};
