import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { Session, TimetableSlot, Student } from '../../types';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [todaySchedule, setTodaySchedule] = useState<TimetableSlot[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [defaulters, setDefaulters] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [tt, sess, defs] = await Promise.all([
          api.timetable.myToday(user.id),
          api.sessions.list(),
          api.offerings.getDefaulters('offering-cs401-7a'),
        ]);
        setTodaySchedule(tt);
        setSessions(sess);
        setDefaulters(defs);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const activeSession = sessions.find((s) => s.status === 'OPEN' && s.teacherId === user?.id);

  const handleOpenSession = async (slot: TimetableSlot) => {
    try {
      // Find matching session or open first available
      const matching = sessions.find((s) => s.offeringId === slot.offeringId && s.status === 'SCHEDULED') || sessions[0];
      await api.sessions.open(matching.id);
      toast.success(`Attendance session opened for ${slot.subjectName} (${slot.sectionName}).`);
      navigate(`/teacher/take-attendance?sessionId=${matching.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not open session');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name}. Here is your class schedule and attendance overview.
          </p>
        </div>

        {activeSession && (
          <button
            onClick={() => navigate(`/teacher/take-attendance?sessionId=${activeSession.id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
          >
            <PlayCircle className="w-4 h-4 animate-pulse" />
            Resume Live Attendance ({activeSession.subjectCode})
          </button>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TODAY'S CLASSES"
          value={todaySchedule.length || 3}
          subtitle="Scheduled lectures & labs"
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCard
          title="ACTIVE SESSIONS"
          value={activeSession ? '1 Active' : '0 Active'}
          subtitle={activeSession ? `${activeSession.roomCode} attendance window` : 'Ready to open'}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="AVG ATTENDANCE"
          value="84.6%"
          trend={{ value: '+2.4%', positive: true }}
          subtitle="Across assigned courses"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          title="DEFAULTERS (<75%)"
          value={defaulters.length}
          trend={{ value: 'Action required', positive: false }}
          subtitle="Under 75% attendance"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Main Grid: Schedule Cards + Defaulters list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Today's Lecture Schedule
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Fall 2026 Term
            </span>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((slot) => {
              const isSlotActive = activeSession?.offeringId === slot.offeringId;
              return (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.subjectCode} · {slot.subjectName}
                      </span>
                      <StatusBadge status={isSlotActive ? 'OPEN' : 'SCHEDULED'} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.roomCode}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Section {slot.sectionName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenSession(slot)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
                    >
                      {isSlotActive ? 'Resume Session' : 'Open Session'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Defaulters & Review Notice */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Attendance Defaulters
            </h2>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
              Below 75%
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Students at immediate risk of semester examination debarment:
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {defaulters.slice(0, 4).map((stu) => (
                <div key={stu.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
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
                    <p className="text-[10px] text-slate-400">
                      {Math.ceil((0.75 * 60 - stu.overallAttendancePercentage * 0.6) / 0.25)} needed
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/teacher/reports')}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
            >
              <span>Download Defaulter Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
