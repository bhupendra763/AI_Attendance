import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { CourseOffering, Teacher, Student } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Users, UserCheck, BookOpen, Layers } from 'lucide-react';

export const OfferingsManagement: React.FC = () => {
  const toast = useToast();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [rosterStudents, setRosterStudents] = useState<Student[]>([]);

  // Create form
  const [createData, setCreateData] = useState({
    subjectId: 'sub-cs401',
    sectionId: 'sec-cse-7a',
    teacherId: 'user-teacher-1',
    termId: 'term-fall-2026',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [offs, teas] = await Promise.all([
        api.offerings.list(),
        api.teachers.list(),
      ]);
      setOfferings(offs);
      setTeachers(teas);
    } catch {
      toast.error('Failed to load course offerings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.offerings.create(createData);
      toast.success('Course offering established.');
      setIsCreateOpen(false);
      await loadData();
    } catch {
      toast.error('Failed to create offering');
    }
  };

  const handleReassignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering || !selectedTeacherId) return;
    try {
      await api.offerings.updateTeacher(selectedOffering.id, selectedTeacherId);
      toast.success('Instructor re-assigned successfully.');
      setIsAssignOpen(false);
      await loadData();
    } catch {
      toast.error('Reassignment failed');
    }
  };

  const handleViewRoster = async (off: CourseOffering) => {
    setSelectedOffering(off);
    setIsRosterOpen(true);
    try {
      const res = await api.students.list({ sectionId: off.sectionId, size: 50 });
      setRosterStudents(res.content);
    } catch {
      // silent
    }
  };

  const columns: Column<CourseOffering>[] = [
    {
      key: 'subjectCode',
      header: 'Course Code',
      accessor: (o) => <span className="font-mono font-bold text-xs">{o.subjectCode}</span>,
      sortable: true,
    },
    {
      key: 'subjectName',
      header: 'Course Name',
      accessor: (o) => <span className="font-semibold text-xs">{o.subjectName}</span>,
      sortable: true,
    },
    {
      key: 'sectionName',
      header: 'Section',
      accessor: (o) => <span className="font-medium text-xs">{o.sectionName}</span>,
      sortable: true,
    },
    {
      key: 'teacherName',
      header: 'Assigned Instructor',
      accessor: (o) => (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs">{o.teacherName}</span>
          <button
            onClick={() => {
              setSelectedOffering(o);
              setSelectedTeacherId(o.teacherId);
              setIsAssignOpen(true);
            }}
            className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
          >
            Re-assign
          </button>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'enrolledStudentsCount',
      header: 'Enrolled',
      accessor: (o) => (
        <button
          onClick={() => handleViewRoster(o)}
          className="font-mono text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          {o.enrolledStudentsCount} students
        </button>
      ),
      sortable: true,
    },
    {
      key: 'averageAttendance',
      header: 'Avg Attendance',
      accessor: (o) => (
        <span
          className={`font-mono text-xs font-bold tabular-nums ${
            o.averageAttendance >= 75
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {o.averageAttendance}%
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Course Offerings & Teacher Assignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map academic subjects to student sections and assign lead instructors for term attendance.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Offering</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={offerings}
        isLoading={isLoading}
        searchPlaceholder="Filter offerings by course, section, or teacher..."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Course Offering"
        description="Bind a subject to a student section and designate an instructor."
      >
        <form onSubmit={handleCreateOffering} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">Subject</label>
            <select
              value={createData.subjectId}
              onChange={(e) => setCreateData({ ...createData, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="sub-cs401">CS401 - Distributed Operating Systems</option>
              <option value="sub-cs402">CS402 - Deep Learning & Computer Vision</option>
              <option value="sub-cs403">CS403 - Cloud Infrastructure & DevOps</option>
              <option value="sub-cs404">CS404 - Applied Cryptography & Security</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Student Section</label>
            <select
              value={createData.sectionId}
              onChange={(e) => setCreateData({ ...createData, sectionId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="sec-cse-7a">CSE-7A (Semester 7)</option>
              <option value="sec-cse-7b">CSE-7B (Semester 7)</option>
              <option value="sec-ece-5a">ECE-5A (Semester 5)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Assign Lead Faculty</label>
            <select
              value={createData.teacherId}
              onChange={(e) => setCreateData({ ...createData, teacherId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Create Offering
            </button>
          </div>
        </form>
      </Modal>

      {/* Re-assign Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Re-assign Course Instructor"
        description={selectedOffering ? `${selectedOffering.subjectCode} - Section ${selectedOffering.sectionName}` : ''}
      >
        <form onSubmit={handleReassignTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">New Designated Instructor</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Update Instructor (PATCH)
            </button>
          </div>
        </form>
      </Modal>

      {/* Enrolled Students Roster Modal */}
      <Modal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        title="Enrolled Section Roster"
        description={selectedOffering ? `${selectedOffering.subjectCode} (${selectedOffering.sectionName})` : ''}
        maxWidth="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Enrolled students currently tracked in attendance registers for this course offering:
          </p>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {rosterStudents.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                  <span className="font-mono text-slate-400 ml-2">({s.studentId})</span>
                </div>
                <span className="font-mono font-bold">{s.overallAttendancePercentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
