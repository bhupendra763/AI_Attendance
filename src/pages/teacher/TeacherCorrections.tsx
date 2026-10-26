import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { AttendanceCorrectionRequest } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Check, X, FileCheck, Calendar, Clock } from 'lucide-react';

export const TeacherCorrections: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const list = await api.corrections.listPending();
      setRequests(list);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await api.corrections.approve(id, user?.name || 'Teacher', 'Verified from lecture records');
        toast.success('Correction request approved and student record updated.');
      } else {
        await api.corrections.reject(id, user?.name || 'Teacher', 'Insufficient evidence');
        toast.info('Correction request rejected.');
      }
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Attendance Correction Requests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review appeals submitted by students regarding disputed attendance marks.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<FileCheck className="w-6 h-6 text-emerald-500" />}
            title="No Pending Correction Requests"
            description="There are currently no disputed attendance records waiting for instructor review."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.studentName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {req.studentRoll}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {req.subjectName}
                    </span>
                    <span>·</span>
                    <span>Date: {req.sessionDate}</span>
                    <span>·</span>
                    <span>
                      Marked <strong className="text-rose-500">{req.currentStatus}</strong> → Requested <strong className="text-emerald-500">{req.requestedStatus}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-100 dark:border-slate-800 italic leading-relaxed">
                    "{req.reason}"
                  </p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(req.id, false)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, true)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
                    >
                      Approve Correction
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
