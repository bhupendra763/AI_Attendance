import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import {
  Department,
  Program,
  AcademicTerm,
  Section,
  Subject,
  Room,
  Holiday,
} from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  MapPin,
  CalendarDays,
} from 'lucide-react';

type MasterTab = 'DEPARTMENTS' | 'PROGRAMS' | 'TERMS' | 'SECTIONS' | 'SUBJECTS' | 'ROOMS' | 'HOLIDAYS';

export const MasterData: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<MasterTab>('DEPARTMENTS');

  // Master collections
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Confirm state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form input state
  const [formData, setFormData] = useState<Record<string, any>>({});

  const loadAllMasterData = async () => {
    setIsLoading(true);
    try {
      const [deps, progs, trms, secs, subs, rms, hols] = await Promise.all([
        api.departments.list(),
        api.programs.list(),
        api.terms.list(),
        api.sections.list(),
        api.subjects.list(),
        api.rooms.list(),
        api.holidays.list(),
      ]);
      setDepartments(deps);
      setPrograms(progs);
      setTerms(trms);
      setSections(secs);
      setSubjects(subs);
      setRooms(rms);
      setHolidays(hols);
    } catch {
      toast.error('Failed to load master dataset');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasterData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'DEPARTMENTS') {
        if (editingItem) {
          await api.departments.update(editingItem.id, formData);
        } else {
          await api.departments.create(formData);
        }
      } else if (activeTab === 'PROGRAMS') {
        if (editingItem) {
          await api.programs.update(editingItem.id, formData);
        } else {
          await api.programs.create(formData);
        }
      } else if (activeTab === 'TERMS') {
        await api.terms.create(formData);
      } else if (activeTab === 'SECTIONS') {
        await api.sections.create(formData);
      } else if (activeTab === 'SUBJECTS') {
        await api.subjects.create(formData);
      } else if (activeTab === 'ROOMS') {
        await api.rooms.create(formData);
      } else if (activeTab === 'HOLIDAYS') {
        await api.holidays.create(formData);
      }

      toast.success(`${activeTab.toLowerCase()} record saved.`);
      setIsModalOpen(false);
      await loadAllMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Save operation failed');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      if (activeTab === 'DEPARTMENTS') await api.departments.delete(confirmDeleteId);
      if (activeTab === 'PROGRAMS') await api.programs.delete(confirmDeleteId);
      if (activeTab === 'TERMS') await api.terms.delete(confirmDeleteId);
      if (activeTab === 'SECTIONS') await api.sections.delete(confirmDeleteId);
      if (activeTab === 'SUBJECTS') await api.subjects.delete(confirmDeleteId);
      if (activeTab === 'ROOMS') await api.rooms.delete(confirmDeleteId);
      if (activeTab === 'HOLIDAYS') await api.holidays.delete(confirmDeleteId);

      toast.success('Record removed.');
      setConfirmDeleteId(null);
      await loadAllMasterData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSetCurrentTerm = async (id: string) => {
    try {
      await api.terms.setCurrent(id);
      toast.success('Active academic term updated.');
      await loadAllMasterData();
    } catch {
      toast.error('Failed to set current term');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Master Data
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional schema, departments, rooms, terms, and sections.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab.slice(0, -1).toLowerCase()}</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { key: 'DEPARTMENTS', label: 'Departments', icon: Building },
          { key: 'PROGRAMS', label: 'Programs', icon: GraduationCap },
          { key: 'TERMS', label: 'Academic Terms', icon: Calendar },
          { key: 'SECTIONS', label: 'Sections', icon: Layers },
          { key: 'SUBJECTS', label: 'Subjects', icon: BookOpen },
          { key: 'ROOMS', label: 'Rooms & Halls', icon: MapPin },
          { key: 'HOLIDAYS', label: 'Holidays', icon: CalendarDays },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as MasterTab)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Table Display */}
      {activeTab === 'DEPARTMENTS' && (
        <DataTable
          columns={[
            { key: 'code', header: 'Code', accessor: (d) => <span className="font-mono font-bold">{d.code}</span>, sortable: true },
            { key: 'name', header: 'Department Name', sortable: true },
            { key: 'headOfDepartment', header: 'Head of Department', sortable: true },
            { key: 'totalStudents', header: 'Students', accessor: (d) => <span className="font-mono">{d.totalStudents}</span>, sortable: true },
            { key: 'totalTeachers', header: 'Faculty', accessor: (d) => <span className="font-mono">{d.totalTeachers}</span>, sortable: true },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (d) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => handleOpenEdit(d)} className="p-1 hover:text-sky-500"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setConfirmDeleteId(d.id)} className="p-1 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ),
            },
          ]}
          data={departments}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'PROGRAMS' && (
        <DataTable
          columns={[
            { key: 'code', header: 'Code', accessor: (p) => <span className="font-mono font-bold">{p.code}</span>, sortable: true },
            { key: 'name', header: 'Program Name', sortable: true },
            { key: 'degree', header: 'Degree', sortable: true },
            { key: 'departmentName', header: 'Department', sortable: true },
            { key: 'totalSemesters', header: 'Semesters', accessor: (p) => <span className="font-mono">{p.totalSemesters}</span>, sortable: true },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (p) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => handleOpenEdit(p)} className="p-1 hover:text-sky-500"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setConfirmDeleteId(p.id)} className="p-1 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ),
            },
          ]}
          data={programs}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'TERMS' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Term Name', sortable: true },
            { key: 'startDate', header: 'Start Date', accessor: (t) => <span className="font-mono">{t.startDate}</span>, sortable: true },
            { key: 'endDate', header: 'End Date', accessor: (t) => <span className="font-mono">{t.endDate}</span>, sortable: true },
            {
              key: 'isCurrent',
              header: 'Status',
              accessor: (t) => (
                t.isCurrent ? (
                  <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Current Active Term
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetCurrentTerm(t.id)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Set as Current Term
                  </button>
                )
              ),
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (t) => (
                <button onClick={() => setConfirmDeleteId(t.id)} className="p-1 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={terms}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'SECTIONS' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Section', accessor: (s) => <span className="font-bold">{s.name}</span>, sortable: true },
            { key: 'programName', header: 'Degree Program', sortable: true },
            { key: 'semester', header: 'Semester', accessor: (s) => <span className="font-mono">{s.semester}</span>, sortable: true },
            { key: 'capacity', header: 'Capacity', accessor: (s) => <span className="font-mono">{s.capacity}</span>, sortable: true },
            { key: 'studentCount', header: 'Enrolled', accessor: (s) => <span className="font-mono">{s.studentCount}</span>, sortable: true },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (s) => (
                <button onClick={() => setConfirmDeleteId(s.id)} className="p-1 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={sections}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'SUBJECTS' && (
        <DataTable
          columns={[
            { key: 'code', header: 'Course Code', accessor: (s) => <span className="font-mono font-bold">{s.code}</span>, sortable: true },
            { key: 'name', header: 'Course Name', sortable: true },
            { key: 'credits', header: 'Credits', accessor: (s) => <span className="font-mono">{s.credits}</span>, sortable: true },
            { key: 'type', header: 'Curriculum Type', accessor: (s) => <span className="font-mono text-[11px]">{s.type}</span>, sortable: true },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (s) => (
                <button onClick={() => setConfirmDeleteId(s.id)} className="p-1 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={subjects}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'ROOMS' && (
        <DataTable
          columns={[
            { key: 'code', header: 'Room Code', accessor: (r) => <span className="font-bold font-mono">{r.code}</span>, sortable: true },
            { key: 'building', header: 'Building / Block', sortable: true },
            { key: 'floor', header: 'Floor', accessor: (r) => <span className="font-mono">{r.floor}</span>, sortable: true },
            { key: 'capacity', header: 'Seating Capacity', accessor: (r) => <span className="font-mono">{r.capacity}</span>, sortable: true },
            {
              key: 'hasCamera',
              header: 'AI Vision Rig',
              accessor: (r) => (
                r.hasCamera ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    Camera Installed
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">None</span>
                )
              ),
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (r) => (
                <button onClick={() => setConfirmDeleteId(r.id)} className="p-1 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={rooms}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'HOLIDAYS' && (
        <DataTable
          columns={[
            { key: 'name', header: 'Holiday / Recess Name', sortable: true },
            { key: 'date', header: 'Start Date', accessor: (h) => <span className="font-mono">{h.date}</span>, sortable: true },
            { key: 'endDate', header: 'End Date', accessor: (h) => <span className="font-mono">{h.endDate || 'Single day'}</span> },
            { key: 'type', header: 'Classification', accessor: (h) => <span className="font-mono text-[11px]">{h.type}</span> },
            {
              key: 'actions',
              header: '',
              align: 'right',
              accessor: (h) => (
                <button onClick={() => setConfirmDeleteId(h.id)} className="p-1 hover:text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
          data={holidays}
          isLoading={isLoading}
        />
      )}

      {/* Creation / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Create'} ${activeTab.slice(0, -1)}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Name / Title</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            />
          </div>

          {(activeTab === 'DEPARTMENTS' || activeTab === 'PROGRAMS' || activeTab === 'SUBJECTS' || activeTab === 'ROOMS') && (
            <div>
              <label className="block text-xs font-semibold mb-1">Code / Identifier</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md uppercase font-mono"
              />
            </div>
          )}

          {activeTab === 'ROOMS' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasCam"
                checked={!!formData.hasCamera}
                onChange={(e) => setFormData({ ...formData, hasCamera: e.target.checked })}
              />
              <label htmlFor="hasCam" className="text-xs">
                Equipped with ceiling-mounted AI attendance camera
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Master Record"
        message="Are you sure you want to delete this master data entity? This may affect historical timetable and attendance joins."
        isDestructive={true}
      />
    </div>
  );
};
