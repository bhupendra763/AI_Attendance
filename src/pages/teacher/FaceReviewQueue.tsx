import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { FaceReviewEvent } from '../../types';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ScanFace, Check, X, ShieldAlert, Clock, UserCheck } from 'lucide-react';

export const FaceReviewQueue: React.FC = () => {
  const [queue, setQueue] = useState<FaceReviewEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchQueue = async () => {
    try {
      const list = await api.faces.reviewQueue();
      setQueue(list);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (id: string, approve: boolean) => {
    try {
      await api.faces.review(id, approve);
      toast.success(
        approve
          ? 'Event approved. Student attendance record updated to Present.'
          : 'Event rejected. Fraudulent or ambiguous attempt discarded.'
      );
      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Face Recognition Review Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manual verification for camera sweeps below confidence thresholds or flagged for liveness anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending items:
          </span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums">
            {queue.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border rounded-lg animate-pulse space-y-4">
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : queue.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-6 h-6 text-emerald-500" />}
          title="Review Queue Clear"
          description="All biometric captures have met the 85% facial threshold and passed anti-spoof checks."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Captured Snapshot Frame with fallback container */}
                <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.snapshotUrl}
                    alt={`Face capture frame for ${item.studentName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback gracefully
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={item.reason} size="sm" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Confidence: {item.confidenceScore}%
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.studentName}
                    </h3>
                    <span className="font-mono text-xs text-slate-400">
                      {item.studentRoll}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                    {item.sessionTitle}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Captured: {new Date(item.capturedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDecision(item.id, false)}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Match
                </button>
                <button
                  onClick={() => handleDecision(item.id, true)}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve (Present)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
