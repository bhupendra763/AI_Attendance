import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { User, UserRole } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { UserCog, Lock, Unlock, Shield, Mail, Phone } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Role Change Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('STUDENT');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const list = await api.users.list();
      setUsers(list);
    } catch {
      toast.error('Failed to load system users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleLock = async (user: User) => {
    const nextStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    try {
      await api.users.updateStatus(user.id, nextStatus);
      toast.success(`Account for ${user.name} is now ${nextStatus}.`);
      await fetchUsers();
    } catch {
      toast.error('Failed to update account lock status');
    }
  };

  const handleOpenRoleModal = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.users.updateRole(selectedUser.id, newRole);
      toast.success(`Role for ${selectedUser.name} changed to ${newRole}.`);
      setIsRoleModalOpen(false);
      await fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User Identity',
      accessor: (u) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{u.name}</p>
          <span className="font-mono text-[11px] text-slate-400">{u.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'role',
      header: 'Assigned Role',
      accessor: (u) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
          {u.role}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'departmentName',
      header: 'Affiliation',
      accessor: (u) => <span className="text-xs text-slate-500">{u.departmentName || 'Collegiate Council'}</span>,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (u) => <StatusBadge status={u.status} size="sm" />,
      sortable: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      accessor: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenRoleModal(u)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
          >
            Change Role
          </button>
          <button
            onClick={() => handleToggleLock(u)}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              u.status === 'LOCKED' ? 'text-amber-500' : 'text-slate-400 hover:text-rose-500'
            }`}
            title={u.status === 'LOCKED' ? 'Unlock Account' : 'Lock Account'}
          >
            {u.status === 'LOCKED' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
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
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage system logins, security locks, and role assignments across faculty and administration.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Filter users by name, email, or role..."
      />

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Modify User Role"
        description={selectedUser ? `Adjust access level for ${selectedUser.name}` : ''}
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            >
              <option value="ADMIN">ADMIN (Full Governance)</option>
              <option value="TEACHER">TEACHER (Course Instructor)</option>
              <option value="STUDENT">STUDENT (Attendee)</option>
              <option value="PARENT">PARENT (Guardian Monitor)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Save Role Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
