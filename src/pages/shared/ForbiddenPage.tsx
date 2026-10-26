import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth, getDefaultRouteForRole } from '../../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-full text-rose-600 dark:text-rose-400 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        403 - Access Forbidden
      </h1>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
        Your current role ({role || 'Guest'}) does not hold authorized cryptographic clearance for this academic resource.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => navigate(getDefaultRouteForRole(role))}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
