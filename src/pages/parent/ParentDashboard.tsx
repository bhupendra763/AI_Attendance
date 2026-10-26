import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { StudentShortfallSummary, LeaveRequest } from '../../types';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BookOpen,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<StudentShortfallSummary | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sum, lvs] = await Promise.all([
          api.attendance.shortfall('user-student-1'),
          api.leaves.list(),
        ]);
        setSummary(sum);
        setLeaves(lvs.filter((l) => l.studentId === 'user-student-1'));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const atRisk = summary?.subjects.filter((s) => s.percentage < 75) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Parent & Guardian Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time academic attendance monitor for linked ward: <strong>Alex Chen</strong> (STU-2023-0101).
        </p>
      </div>

      {/* Ward Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-lg font-bold">
            AC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Alex Chen
              </h2>
              <StatusBadge status="ACTIVE" size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Roll No: STU-2023-0101 · B.Tech Computer Science & Engineering (Semester 7) · Section CSE-7A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            student@demo.com
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            +1 (555) 456-7890
          </span>
        </div>
      </div>

      {/* Shortfall Alert */}
      {atRisk.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">
              Institutional Attendance Warning for Alex Chen
            </p>
            <p className="mt-1">
              Your child currently has attendance under 75% in {atRisk.map((a) => a.subjectName).join(', ')}. College policies require parents to be notified when attendance drops below the 75% examination eligibility line.
            </p>
          </div>
        </div>
      )}

      {/* Attendance Circular Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <CircularProgress
            percentage={summary?.overallPercentage || 81.5}
            size={115}
            strokeWidth={10}
            threshold={75}
          />
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overall Ward Attendance
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {summary?.overallPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Attended {summary?.totalClassesAttended} of {summary?.totalClassesHeld} classes across all courses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs w-full md:w-auto">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Minimum Required
            </span>
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
              75.0%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Pending Leaves
            </span>
            <span className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">
              {leaves.filter((l) => l.status === 'PENDING').length}
            </span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Course-by-Course Attendance Status
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {summary?.subjects.map((sub) => (
            <div
              key={sub.offeringId}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {sub.subjectCode}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {sub.subjectName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Instructor: {sub.teacherName} · Attended {sub.attendedClasses} of {sub.totalClasses} classes
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                  {sub.percentage.toFixed(1)}%
                </span>
                <StatusBadge status={sub.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
