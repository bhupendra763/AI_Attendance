import React, { useState } from 'react';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { FileText, Download, CheckCircle, Calendar, Filter } from 'lucide-react';

export const ReportsGenerator: React.FC = () => {
  const toast = useToast();
  const [reportType, setReportType] = useState<'offering' | 'section' | 'student' | 'department'>('offering');
  const [targetId, setTargetId] = useState('offering-cs401-7a');
  const [startDate, setStartDate] = useState('2026-08-15');
  const [endDate, setEndDate] = useState('2026-10-26');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    setIsExporting(true);
    try {
      await api.reports.download(reportType, targetId, format);
      toast.success(`Generated official ${format.toUpperCase()} attendance dossier for ${targetId}.`);
    } catch {
      toast.error('Report generation failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Institutional Reports & Debarment Lists
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export certified attendance registers, NAAC/ABET audit documents, and examination eligibility rosters.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Report Level & Hierarchy</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'offering', label: 'Course Offering' },
              { key: 'section', label: 'Student Section' },
              { key: 'department', label: 'Department' },
              { key: 'student', label: 'Individual Student' },
            ].map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => {
                  setReportType(type.key as any);
                  if (type.key === 'offering') setTargetId('offering-cs401-7a');
                  if (type.key === 'section') setTargetId('sec-cse-7a');
                  if (type.key === 'department') setTargetId('dept-cse');
                  if (type.key === 'student') setTargetId('STU-2023-0101');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                  reportType === type.key
                    ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Entity Selection</label>
          {reportType === 'offering' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="offering-cs401-7a">CS401 - Distributed OS (CSE-7A)</option>
              <option value="offering-cs402-7a">CS402 - Deep Learning (CSE-7A)</option>
              <option value="offering-cs403-7a">CS403 - Cloud DevOps (CSE-7A)</option>
            </select>
          )}

          {reportType === 'section' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="sec-cse-7a">Section CSE-7A (Semester 7)</option>
              <option value="sec-cse-7b">Section CSE-7B (Semester 7)</option>
              <option value="sec-ece-5a">Section ECE-5A (Semester 5)</option>
            </select>
          )}

          {reportType === 'department' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="dept-cse">Computer Science & Engineering</option>
              <option value="dept-ece">Electronics & Communication</option>
              <option value="dept-me">Mechanical Engineering</option>
            </select>
          )}

          {reportType === 'student' && (
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. STU-2023-0101"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Date From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Date To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>

          <button
            onClick={() => handleDownload('xlsx')}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel Spreadsheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
