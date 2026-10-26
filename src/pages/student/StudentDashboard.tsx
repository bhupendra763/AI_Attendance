import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { StudentShortfallSummary, TimetableSlot } from '../../types';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<StudentShortfallSummary | null>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const [sum, tt] = await Promise.all([
          api.attendance.shortfall(user.id),
          api.timetable.bySection('sec-cse-7a'),
        ]);
        setSummary(sum);
        // filter for today (e.g. Monday/Wednesday)
        setTimetable(tt.filter((t) => t.dayOfWeek === 'MONDAY'));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  const atRiskSubjects = summary?.subjects.filter((s) => s.percentage < 75) || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Attendance Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name}. Section CSE-7A · Semester 7.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/check-in')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Check In Now (QR / GPS)</span>
          </button>
        </div>
      </div>

      {/* Shortfall Alert Banner if any subject < 75% */}
      {atRiskSubjects.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">
              Attendance Shortfall Notice ({atRiskSubjects.length} subject(s) below mandatory 75% threshold)
            </p>
            <div className="mt-1 space-y-1">
              {atRiskSubjects.map((sub) => (
                <p key={sub.offeringId}>
                  • <strong>{sub.subjectCode} ({sub.subjectName}):</strong> Currently at{' '}
                  <span className="font-mono font-bold">{sub.percentage.toFixed(1)}%</span>. You must attend the next{' '}
                  <span className="font-mono font-bold underline">
                    {sub.shortfallNeeded} consecutive class{sub.shortfallNeeded > 1 ? 'es' : ''}
                  </span>{' '}
                  to restore clearance for final semester exams.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Stat Card with Large Circular Ring */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <CircularProgress
            percentage={summary?.overallPercentage || 81.5}
            size={130}
            strokeWidth={11}
            threshold={75}
          />
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overall Academic Attendance
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {summary && summary.overallPercentage >= 75
                ? 'Academic Standing In Good Standing'
                : 'Debarment Warning Active'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              University regulations mandate a minimum of <strong>75.0%</strong> attendance in every enrolled course to appear in end-semester examinations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 text-xs w-full sm:w-auto">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Classes Attended
            </span>
            <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {summary?.totalClassesAttended} / {summary?.totalClassesHeld}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Biometric Status
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Face Enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Per-Subject Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Subject-Wise Attendance Rings
          </h2>
          <span className="text-xs text-slate-500 font-mono">Current Semester 7</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary?.subjects.map((sub) => (
            <div
              key={sub.offeringId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
                    {sub.subjectCode}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                    {sub.subjectName}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {sub.teacherName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <CircularProgress
                  percentage={sub.percentage}
                  size={95}
                  strokeWidth={8}
                  threshold={75}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {sub.attendedClasses} / {sub.totalClasses} classes
                </span>
                <StatusBadge status={sub.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Today's Timetable & Classes
        </h2>

        <div className="space-y-2">
          {timetable.map((slot) => (
            <div
              key={slot.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {slot.subjectCode} · {slot.subjectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {slot.roomCode}
                    </span>
                    <span>·</span>
                    <span>{slot.teacherName}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/student/check-in')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
              >
                <span>Check In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
