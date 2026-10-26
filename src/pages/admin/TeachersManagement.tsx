import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { Teacher } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Users, Mail, Phone, BookOpen } from 'lucide-react';

export const TeachersManagement: React.FC = () => {
  const toast = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Teacher>>({});

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const list = await api.teachers.list();
      setTeachers(list);
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.teachers.create(formData);
      toast.success('Teacher record added.');
      setIsModalOpen(false);
      await fetchTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save teacher');
    }
  };

  const columns: Column<Teacher>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      accessor: (t) => <span className="font-mono font-bold text-xs">{t.employeeId}</span>,
      sortable: true,
    },
    {
      key: 'name',
      header: 'Faculty Member',
      accessor: (t) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{t.name}</p>
          <span className="text-[11px] text-slate-400">{t.designation}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email & Contact',
      accessor: (t) => (
        <div>
          <p className="font-mono text-xs">{t.email}</p>
          <span className="text-[11px] text-slate-400">{t.phone}</span>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      accessor: (t) => <span className="text-xs">{t.departmentName}</span>,
      sortable: true,
    },
    {
      key: 'totalOfferings',
      header: 'Assigned Courses',
      accessor: (t) => <span className="font-mono text-xs font-bold">{t.totalOfferings || 2}</span>,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Faculty & Instructors Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage teaching faculty, course allocations, and academic departmental affiliations.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({});
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        isLoading={isLoading}
        searchPlaceholder="Search faculty by name, department, or ID..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Faculty Member"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name & Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Alan Turing"
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
              placeholder="name@college.edu"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Designation</label>
              <input
                type="text"
                placeholder="Professor / Associate"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Save Faculty
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
