import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Clock,
  ScanFace,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AuditLog, Student } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [an, logs, stuRes] = await Promise.all([
          api.analytics.dashboard(),
          api.auditLogs.list(),
          api.students.list({ size: 10 }),
        ]);
        setAnalytics(an);
        setAuditLogs(logs.slice(0, 5));
        setStudents(stuRes.content.filter((s) => s.overallAttendancePercentage < 75));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Operations & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time university-wide attendance metrics, edge camera health, and compliance auditing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/sessions')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            Manage Sessions
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL STUDENTS"
          value={analytics?.totalStudents?.toLocaleString() || '1,400'}
          subtitle="Enrolled across 4 departments"
          icon={<GraduationCap className="w-4 h-4" />}
        />
        <StatCard
          title="TEACHING FACULTY"
          value={analytics?.totalTeachers || '82'}
          subtitle="Active faculty members"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="TODAY'S ATTENDANCE"
          value={`${analytics?.todayAttendancePercentage || 86.4}%`}
          trend={{ value: '+1.8% vs last week', positive: true }}
          subtitle="University daily average"
          icon={<CalendarCheck className="w-4 h-4" />}
        />
        <StatCard
          title="ACTIVE SESSIONS"
          value={analytics?.activeSessionsCount || '3'}
          subtitle="Lecture halls & labs open"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Charts Grid: 30-Day Trend & Department Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              30-Day Collegiate Attendance Trend (%)
            </h2>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Target: ≥75%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.attendanceTrend30Days || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={[70, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0284c7' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance By Department Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Attendance Distribution by Department (%)
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Fall 2026 Term
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentRates || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Average Rate']}
                />
                <Bar
                  dataKey="rate"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Attendance Defaulters & Audit Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Defaulter Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Low-Attendance Students (&lt;75%)
              </h2>
            </div>
            <button
              onClick={() => navigate('/admin/students')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              View all students →
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Students facing automatic debarment notices under current attendance policy:
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.slice(0, 4).map((stu) => (
              <div key={stu.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {stu.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {stu.studentId} · {stu.sectionName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {stu.overallAttendancePercentage.toFixed(1)}%
                  </span>
                  <div className="mt-0.5">
                    <StatusBadge status="WARNING" size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Security & Ledger Audit Log
              </h2>
            </div>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              Full audit log →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-1">
                  {log.details}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Actor: {log.actorEmail}</span>
                  <span>·</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
