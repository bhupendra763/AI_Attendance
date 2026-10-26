import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { TimetableSlot, DayOfWeek, Room, Teacher, CourseOffering } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '09:00 - 10:00 AM' },
  { start: '10:15', end: '11:15', label: '10:15 - 11:15 AM' },
  { start: '11:30', end: '12:30', label: '11:30 - 12:30 PM' },
  { start: '14:00', end: '15:00', label: '02:00 - 03:00 PM' },
  { start: '15:15', end: '16:15', label: '03:15 - 04:15 PM' },
];

export const TimetableManagement: React.FC = () => {
  const toast = useToast();
  const [sectionId, setSectionId] = useState('sec-cse-7a');
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Slot Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  // Slot Form
  const [slotForm, setSlotForm] = useState({
    offeringId: 'offering-cs401-7a',
    roomId: 'room-lh101',
    dayOfWeek: 'MONDAY' as DayOfWeek,
    startTime: '09:00',
    endTime: '10:00',
  });

  const loadTimetable = async () => {
    setIsLoading(true);
    try {
      const [tt, rms, teas, offs] = await Promise.all([
        api.timetable.bySection(sectionId),
        api.rooms.list(),
        api.teachers.list(),
        api.offerings.list(),
      ]);
      setTimetable(tt);
      setRooms(rms);
      setTeachers(teas);
      setOfferings(offs);
    } catch {
      toast.error('Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [sectionId]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const off = offerings.find((o) => o.id === slotForm.offeringId);
    const rm = rooms.find((r) => r.id === slotForm.roomId);

    if (!off || !rm) return;

    try {
      await api.timetable.create({
        offeringId: off.id,
        subjectName: off.subjectName,
        subjectCode: off.subjectCode,
        sectionId,
        sectionName: off.sectionName,
        teacherId: off.teacherId,
        teacherName: off.teacherName,
        roomId: rm.id,
        roomCode: rm.code,
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
      });

      toast.success('Timetable slot scheduled.');
      setIsAddOpen(false);
      await loadTimetable();
    } catch (err: any) {
      // Show 409 Conflict error prominently!
      if (err.status === 409) {
        setConflictError(err.message || 'Timetable Clash Conflict (HTTP 409)');
      } else {
        toast.error(err.message || 'Failed to create slot');
      }
    }
  };

  const handleDeleteSlot = async () => {
    if (!deleteSlotId) return;
    try {
      await api.timetable.delete(deleteSlotId);
      toast.success('Slot removed from weekly timetable.');
      setDeleteSlotId(null);
      await loadTimetable();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Weekly Timetable & Conflict Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual weekly matrix per section with automatic HTTP 409 clash prevention for rooms, teachers, and student cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="sec-cse-7a">Section: CSE-7A (Sem 7)</option>
            <option value="sec-cse-7b">Section: CSE-7B (Sem 7)</option>
            <option value="sec-ece-5a">Section: ECE-5A (Sem 5)</option>
          </select>

          <button
            onClick={() => {
              setConflictError(null);
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 text-xs font-semibold">
              <th className="py-3 px-4 w-32 border-r border-slate-200 dark:border-slate-800">
                Time Window
              </th>
              {DAYS.map((day) => (
                <th key={day} className="py-3 px-4 capitalize font-bold text-center">
                  {day.toLowerCase()}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.start} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 whitespace-nowrap">
                  {slot.start} - {slot.end}
                </td>

                {DAYS.map((day) => {
                  const matching = timetable.find(
                    (t) => t.dayOfWeek === day && t.startTime === slot.start
                  );

                  return (
                    <td key={day} className="p-2 align-top text-center border-r last:border-r-0 border-slate-100 dark:border-slate-800/60 min-w-[140px]">
                      {matching ? (
                        <div className="group relative p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-md text-left transition-all hover:shadow-xs">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-xs">
                              {matching.subjectCode}
                            </span>
                            <button
                              onClick={() => setDeleteSlotId(matching.id)}
                              className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                            {matching.subjectName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                            <span>{matching.roomCode}</span>
                            <span className="truncate max-w-[80px]">{matching.teacherName}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                          —
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal with HTTP 409 Conflict Alert */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Timetable Slot"
        description="Assign course, room, day and time with real-time clash verification."
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {conflictError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-md text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>409 Conflict Detected</span>
              </div>
              <p className="leading-relaxed">{conflictError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">Course Offering</label>
            <select
              value={slotForm.offeringId}
              onChange={(e) => setSlotForm({ ...slotForm, offeringId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.subjectCode} - {o.subjectName} ({o.teacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Lecture Room / Lab</label>
              <select
                value={slotForm.roomId}
                onChange={(e) => setSlotForm({ ...slotForm, roomId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} ({r.building}) {r.hasCamera ? '🎥' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Day of Week</label>
              <select
                value={slotForm.dayOfWeek}
                onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md capitalize"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Time</label>
              <select
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value, endTime: e.target.value === '09:00' ? '10:00' : '11:15' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:15">10:15 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:15">03:15 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">End Time</label>
              <input
                type="text"
                disabled
                value={slotForm.endTime}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border rounded-md font-mono text-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Schedule Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteSlotId}
        onClose={() => setDeleteSlotId(null)}
        onConfirm={handleDeleteSlot}
        title="Delete Timetable Slot"
        message="Are you sure you want to remove this timetable slot? Future automated sessions will no longer be generated for this time block."
        isDestructive={true}
      />
    </div>
  );
};
