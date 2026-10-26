import React, { useState } from 'react';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { FileText, Download, CheckCircle, Calendar, BookOpen } from 'lucide-react';

export const TeacherReports: React.FC = () => {
  const toast = useToast();
  const [offeringId, setOfferingId] = useState('offering-cs401-7a');
  const [dateRange, setDateRange] = useState('full-term');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    setIsExporting(true);
    try {
      await api.reports.download('offering', offeringId, format);
      toast.success(`Generated official ${format.toUpperCase()} attendance register.`);
    } catch {
      toast.error('Could not download report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Class Attendance Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Export institutional attendance registers, semester summaries, and debarment warning sheets.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs max-w-xl space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Course Offering
          </label>
          <select
            value={offeringId}
            onChange={(e) => setOfferingId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
          >
            <option value="offering-cs401-7a">CS401 - Distributed Operating Systems (CSE-7A)</option>
            <option value="offering-cs402-7a">CS402 - Deep Learning & Computer Vision (CSE-7A)</option>
            <option value="offering-cs403-7a">CS403 - Cloud Infrastructure & DevOps (CSE-7A)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Reporting Date Scope
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
          >
            <option value="full-term">Full Academic Term (Fall 2026 to Date)</option>
            <option value="last-30">Last 30 Days</option>
            <option value="last-week">Current Academic Week</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Register</span>
          </button>

          <button
            onClick={() => handleDownload('xlsx')}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (XLSX)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
