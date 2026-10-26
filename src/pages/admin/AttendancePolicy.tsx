import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { AttendancePolicy as PolicyType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Sliders, ShieldCheck, Clock, ScanFace, CheckCircle2, Save } from 'lucide-react';

export const AttendancePolicy: React.FC = () => {
  const toast = useToast();
  const [policies, setPolicies] = useState<PolicyType[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [currentPolicy, setCurrentPolicy] = useState<PolicyType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await api.policies.list();
        setPolicies(list);
        if (list.length > 0) {
          setSelectedPolicyId(list[0].id);
          setCurrentPolicy({ ...list[0] });
        }
      } catch {
        toast.error('Failed to load attendance policies');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSelectProgram = (id: string) => {
    setSelectedPolicyId(id);
    const pol = policies.find((p) => p.id === id);
    if (pol) setCurrentPolicy({ ...pol });
  };

  const handleSave = async () => {
    if (!currentPolicy) return;
    setIsSaving(true);
    try {
      await api.policies.update(currentPolicy.id, currentPolicy);
      toast.success(`Updated academic attendance policy for ${currentPolicy.programName}.`);
      setPolicies((prev) =>
        prev.map((p) => (p.id === currentPolicy.id ? { ...currentPolicy } : p))
      );
    } catch {
      toast.error('Policy update failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Institutional Attendance Policy & Thresholds
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure minimum required attendance percentages, late-arrival limits, and AI facial confidence tolerances using sliders.
        </p>
      </div>

      {/* Program Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Select Academic Degree Program
        </label>
        <select
          value={selectedPolicyId}
          onChange={(e) => handleSelectProgram(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-semibold"
        >
          {policies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.programName}
            </option>
          ))}
        </select>
      </div>

      {currentPolicy && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-6">
          {/* Slider 1: Minimum Attendance Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Minimum Attendance Requirement
                </span>
                <span className="text-[11px] text-slate-400">
                  Threshold below which student faces exam debarment.
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {currentPolicy.minimumPercentage}%
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={90}
              step={1}
              value={currentPolicy.minimumPercentage}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, minimumPercentage: Number(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>60% (Lenient)</span>
              <span>75% (UGC Standard)</span>
              <span>90% (Strict)</span>
            </div>
          </div>

          {/* Slider 2: Late-After Minutes */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Late Arrival Tolerance
                </span>
                <span className="text-[11px] text-slate-400">
                  Check-ins after this time buffer are logged as LATE rather than PRESENT.
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {currentPolicy.lateAfterMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={currentPolicy.lateAfterMinutes}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, lateAfterMinutes: Number(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 mins</span>
              <span>15 mins (Standard)</span>
              <span>30 mins</span>
            </div>
          </div>

          {/* Slider 3: Face Match Confidence Threshold */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Facial Match Auto-Approval Threshold
                </span>
                <span className="text-[11px] text-slate-400">
                  Vector cosine similarity score required for instant check-in without instructor review.
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {currentPolicy.faceMatchThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={98}
              step={1}
              value={currentPolicy.faceMatchThreshold}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, faceMatchThreshold: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>70%</span>
              <span>85% (High Precision)</span>
              <span>98% (Ultra Strict)</span>
            </div>
          </div>

          {/* Slider 4: Face Review Queue Threshold */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Face Review Queue Lower Bound
                </span>
                <span className="text-[11px] text-slate-400">
                  Captures between this bound and the match threshold are placed into the teacher review queue.
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                {currentPolicy.reviewQueueThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={80}
              step={1}
              value={currentPolicy.reviewQueueThreshold}
              onChange={(e) =>
                setCurrentPolicy({ ...currentPolicy, reviewQueueThreshold: Number(e.target.value) })
              }
              className="w-full accent-slate-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>50%</span>
              <span>70% (Standard)</span>
              <span>80%</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Applying...' : 'Save Program Policy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
