import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Camera,
  Sliders,
  CheckSquare,
  FileText,
  ScanFace,
  ShieldAlert,
  UserCog,
  QrCode,
  CalendarPlus,
  AlertCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Master Data', path: '/admin/master-data', icon: Database },
          { label: 'Students', path: '/admin/students', icon: GraduationCap },
          { label: 'Teachers', path: '/admin/teachers', icon: Users },
          { label: 'Course Offerings', path: '/admin/offerings', icon: BookOpen },
          { label: 'Timetable & Clash Grid', path: '/admin/timetable', icon: Calendar },
          { label: 'Academic Sessions', path: '/admin/sessions', icon: Clock },
          { label: 'Hardware Devices', path: '/admin/devices', icon: Camera },
          { label: 'Attendance Policy', path: '/admin/policy', icon: Sliders },
          { label: 'Approvals Queue', path: '/admin/approvals', icon: CheckSquare },
          { label: 'Institutional Reports', path: '/admin/reports', icon: FileText },
          { label: 'Face AI Analytics', path: '/admin/face-analytics', icon: ScanFace },
          { label: 'System Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
          { label: 'User Directory', path: '/admin/users', icon: UserCog },
        ];

      case 'TEACHER':
        return [
          { label: 'Today\'s Schedule', path: '/teacher/dashboard', icon: LayoutDashboard },
          { label: 'My Classes & Courses', path: '/teacher/classes', icon: BookOpen },
          { label: 'Take Attendance', path: '/teacher/take-attendance', icon: Camera },
          { label: 'Face Review Queue', path: '/teacher/review-queue', icon: ScanFace },
          { label: 'Correction Requests', path: '/teacher/corrections', icon: FileCheck },
          { label: 'Attendance Reports', path: '/teacher/reports', icon: FileText },
        ];

      case 'STUDENT':
        return [
          { label: 'Overview & Shortfall', path: '/student/dashboard', icon: LayoutDashboard },
          { label: 'Attendance History', path: '/student/history', icon: Calendar },
          { label: 'Scan & Geofence Check-In', path: '/student/check-in', icon: QrCode },
          { label: 'Apply for Leave', path: '/student/leave', icon: CalendarPlus },
          { label: 'Raise Correction', path: '/student/correction', icon: AlertCircle },
          { label: 'Privacy & Face Wizard', path: '/student/biometric', icon: ScanFace },
        ];

      case 'PARENT':
        return [
          { label: 'Ward Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
          { label: 'Subject Breakdown', path: '/parent/attendance', icon: BookOpen },
          { label: 'Leave Applications', path: '/parent/leaves', icon: CalendarPlus },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm">
                AcuAttend
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                COLLEGE ATTENDANCE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {role ? `${role.toLowerCase()} navigation` : 'menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </NavLink>
            );
          })}
        </nav>

        {/* System Status Footnote */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Academic Term</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">Fall 2026</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>AI Liveness Guard</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active (v2.4)</span>
          </div>
        </div>
      </aside>
    </>
  );
};
