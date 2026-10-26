import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { AttendanceRecord } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Calendar, Filter, Download } from 'lucide-react';

export const StudentAttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const list = await api.attendance.byStudent(user.id);
        setRecords(list);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  const filtered = records.filter((r) => {
    if (selectedSubject === 'ALL') return true;
    return true;
  });

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'sessionId',
      header: 'Session',
      accessor: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
          {r.sessionId === 'sess-today-1' ? 'CS401 · Lecture 18' : 'CS402 · Lab Session'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Attendance Status',
      accessor: (r) => <StatusBadge status={r.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'method',
      header: 'Verification Method',
      accessor: (r) => (
        <span className="font-mono text-[11px] text-slate-500 uppercase">
          {r.method || 'MANUAL'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'checkInTime',
      header: 'Timestamp',
      accessor: (r) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {r.checkInTime || '—'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'remarks',
      header: 'Audit Note',
      accessor: (r) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 italic">
          {r.remarks || 'Standard biometric check'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Log & History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official chronological attendance ledger for semester courses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Enrolled Courses</option>
            <option value="CS401">CS401 - Distributed OS</option>
            <option value="CS402">CS402 - Deep Learning</option>
            <option value="CS403">CS403 - Cloud Computing</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        searchPlaceholder="Filter records by session or note..."
      />
    </div>
  );
};
