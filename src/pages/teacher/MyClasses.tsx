import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { CourseOffering, Student } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BookOpen, Users, Clock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const MyClasses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const list = await api.teachers.getMyOfferings(user.id);
        setOfferings(list);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleOpenDetail = async (off: CourseOffering) => {
    setSelectedOffering(off);
    setIsDetailOpen(true);
    try {
      const stuRes = await api.students.list({ sectionId: off.sectionId, size: 100 });
      setStudents(stuRes.content);
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Classes & Course Offerings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review enrolled sections, student rosters, and aggregate attendance benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerings.map((off) => (
          <div
            key={off.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded">
                  {off.subjectCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Sec: {off.sectionName}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {off.subjectName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {off.termName}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Enrolled
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                    {off.enrolledStudentsCount} students
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Avg Attendance
                  </span>
                  <span
                    className={`font-mono font-bold text-base ${
                      off.averageAttendance >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {off.averageAttendance}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleOpenDetail(off)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                View Roster & Stats
              </button>
              <button
                onClick={() => navigate(`/teacher/take-attendance?offeringId=${off.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
              >
                <span>Take Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Offering Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedOffering ? `${selectedOffering.subjectCode} - ${selectedOffering.sectionName}` : 'Class Roster'}
        description={selectedOffering?.subjectName}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Enrolled Students ({students.length})</span>
            <span className="text-slate-400">Semester 7 · CSE Department</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((stu) => (
              <div key={stu.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {stu.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {stu.studentId}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{stu.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-xs ${
                      stu.overallAttendancePercentage >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {stu.overallAttendancePercentage.toFixed(1)}%
                  </span>
                  <StatusBadge
                    status={stu.overallAttendancePercentage >= 75 ? 'SAFE' : 'WARNING'}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
