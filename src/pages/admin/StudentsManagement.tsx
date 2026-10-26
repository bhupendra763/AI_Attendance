import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { Student } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  ScanFace,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const toast = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Bulk CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<{
    successCount: number;
    failureCount: number;
    errors: Array<{ row: number; field: string; message: string }>;
  } | null>(null);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.students.list({
        search,
        status: statusFilter,
        page,
        size: 10,
      });
      setStudents(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter]);

  const handleSearchTrigger = () => {
    setPage(0);
    fetchStudents();
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      sectionId: 'sec-cse-7a',
      status: 'ACTIVE',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({ ...stu });
    setIsFormOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.students.update(editingStudent.id, formData);
        toast.success('Student record updated.');
      } else {
        await api.students.create(formData);
        toast.success('Student created successfully.');
      }
      setIsFormOpen(false);
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.students.delete(deleteId);
      toast.success('Student removed from collegiate directory.');
      setDeleteId(null);
      await fetchStudents();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvData = await api.students.exportCsv();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AcuAttend_Students_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Student roster exported to CSV.');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleBulkImportSubmit = async () => {
    if (!csvText.trim()) {
      toast.error('Please paste or upload CSV rows');
      return;
    }
    const lines = csvText.trim().split('\n');
    const parsedRows = lines.map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      return {
        studentId: parts[0] || `STU-2023-${1000 + idx}`,
        name: parts[1] || '',
        email: parts[2] || '',
        section: parts[3] || 'CSE-7A',
        parentEmail: parts[4] || '',
      };
    });

    try {
      const result = await api.students.bulkImport(parsedRows);
      setImportResult(result);
      if (result.successCount > 0) {
        toast.success(`Imported ${result.successCount} student(s).`);
        await fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk import failed');
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'studentId',
      header: 'Roll No',
      accessor: (s) => <span className="font-mono font-bold text-xs">{s.studentId}</span>,
      sortable: true,
    },
    {
      key: 'name',
      header: 'Full Name',
      accessor: (s) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{s.name}</p>
          <span className="text-[11px] text-slate-400">{s.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'sectionName',
      header: 'Section',
      accessor: (s) => <span className="font-medium text-xs">{s.sectionName}</span>,
      sortable: true,
    },
    {
      key: 'overallAttendancePercentage',
      header: 'Attendance %',
      accessor: (s) => (
        <span
          className={`font-mono font-bold text-xs tabular-nums ${
            s.overallAttendancePercentage >= 75
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {s.overallAttendancePercentage.toFixed(1)}%
        </span>
      ),
      sortable: true,
    },
    {
      key: 'faceEnrolled',
      header: 'Biometric Status',
      accessor: (s) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            s.faceEnrolled
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400'
          }`}
        >
          <ScanFace className="w-3.5 h-3.5" />
          {s.faceEnrolled ? 'Enrolled' : 'Not on file'}
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
      key: 'actions',
      header: '',
      align: 'right',
      accessor: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedStudent(s);
              setIsDetailOpen(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Inspect attendance profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1 text-slate-400 hover:text-sky-500"
            title="Edit student"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(s.id)}
            className="p-1 text-slate-400 hover:text-rose-500"
            title="Delete student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Directory & Biometric Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student enrollments, CSV batch operations, and facial biometric compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImportResult(null);
              setCsvText(
                'STU-2023-0109, Marcus Sterling, marcus.s@college.edu, CSE-7A, parent.marcus@example.com\nSTU-2023-0110, Chloe Bennett, chloe.b@college.edu, CSE-7A, parent.chloe@example.com'
              );
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-800 dark:text-slate-200"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        serverPage={page}
        serverTotalElements={totalElements}
        serverTotalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="Search by name, roll no, or email..."
      />

      {/* Student Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedStudent?.name || 'Student Profile'}
        description={selectedStudent?.studentId}
        maxWidth="md"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Program & Section
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedStudent.programName} ({selectedStudent.sectionName})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Overall Attendance
                </span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                  {selectedStudent.overallAttendancePercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Student Email</span>
                <span className="font-medium text-slate-900 dark:text-white font-mono">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Parent / Guardian</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedStudent.parentName || 'Robert & Clara Chen'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Parent Email</span>
                <span className="font-medium text-slate-900 dark:text-white font-mono">{selectedStudent.parentEmail || 'parent@demo.com'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Biometric Facial Vector</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedStudent.faceEnrolled ? 'Enrolled (AES-256)' : 'Consent Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <form onSubmit={handleSaveStudent} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Roll / Student ID</label>
              <input
                type="text"
                placeholder="STU-2023-XXXX"
                value={formData.studentId || ''}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Section</label>
              <select
                value={formData.sectionId || 'sec-cse-7a'}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              >
                <option value="sec-cse-7a">CSE-7A</option>
                <option value="sec-cse-7b">CSE-7B</option>
                <option value="sec-ece-5a">ECE-5A</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Parent Email</label>
            <input
              type="email"
              value={formData.parentEmail || ''}
              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              placeholder="parent@example.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal with Row-Level Error Reporting */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Students via CSV"
        description="Format: studentId, name, email, section, parentEmail"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            placeholder="STU-2023-0109, Marcus Sterling, marcus.s@college.edu, CSE-7A, parent.marcus@example.com"
          />

          {importResult && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-md border text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ Successfully imported: {importResult.successCount}
                </span>
                {importResult.failureCount > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    ✕ Failed rows: {importResult.failureCount}
                  </span>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  <p className="text-[11px] font-bold text-rose-500 uppercase">
                    Row-Level Error Report:
                  </p>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                      Row {err.row} [{err.field}]: {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Done
            </button>
            <button
              onClick={handleBulkImportSubmit}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Run Batch Import
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student record? This will purge all attendance history and revoke biometric templates."
        isDestructive={true}
      />
    </div>
  );
};
