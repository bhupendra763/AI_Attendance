import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { AuditLog } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ShieldAlert, Download, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AuditLogs: React.FC = () => {
  const toast = useToast();
  const [logs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const list = await api.auditLogs.list();
      setAuditLogs(list);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportLogs = () => {
    const csvContent =
      'Timestamp,Actor,Role,Action,Entity,IP Address,Details\n' +
      logs
        .map(
          (l) =>
            `"${l.timestamp}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.entityType}:${l.entityId}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AcuAttend_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log trail exported as immutable CSV.');
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: (l) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
          {new Date(l.timestamp).toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'action',
      header: 'Security Action',
      accessor: (l) => (
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
          {l.action}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actorEmail',
      header: 'Actor',
      accessor: (l) => (
        <div>
          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{l.actorEmail}</p>
          <span className="font-mono text-[10px] text-slate-400">Role: {l.actorRole}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'entity',
      header: 'Target Entity',
      accessor: (l) => (
        <span className="font-mono text-[11px] text-slate-500">
          {l.entityType} ({l.entityId})
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      accessor: (l) => <span className="font-mono text-xs text-slate-500">{l.ipAddress}</span>,
    },
    {
      key: 'details',
      header: 'Operation Details',
      accessor: (l) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 max-w-sm truncate block">
          {l.details}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Security & Ledger Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Read-only, tamper-evident record of all authentication, manual overrides, and policy changes.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        searchPlaceholder="Filter audit records by actor, action, or IP..."
      />
    </div>
  );
};
