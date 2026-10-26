import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/endpoints';
import { Session, AttendanceRecord, Student } from '../../types';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Camera,
  QrCode,
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  VideoOff,
  UserCheck,
  Power,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const TakeAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const sessionIdParam = searchParams.get('sessionId') || 'sess-today-1';
  const [session, setSession] = useState<Session | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'FACE' | 'QR' | 'MANUAL'>('FACE');
  const [isLoading, setIsLoading] = useState(true);

  // Close session confirm dialog state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Webcam state for Face Mode
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lastRecognitionResult, setLastRecognitionResult] = useState<{
    recognisedCount: number;
    suspectedSpoofs: number;
    students: Array<{ studentId: string; name: string; studentRoll: string; confidenceScore: number; livenessStatus: string }>;
  } | null>(null);

  // QR Mode state
  const [qrToken, setQrToken] = useState<string>('ACU_INITIAL_TOKEN');
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(25);

  // Manual Mode local state: map studentId -> status
  const [manualMarks, setManualMarks] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Fetch session, attendance, and enrolled students
  const loadSessionData = async () => {
    try {
      const [sessionsList, attList, stuRes] = await Promise.all([
        api.sessions.list(),
        api.attendance.bySession(sessionIdParam),
        api.students.list({ sectionId: 'sec-cse-7a', size: 100 }),
      ]);

      const foundSession = sessionsList.find((s) => s.id === sessionIdParam) || sessionsList[0];
      setSession(foundSession);
      setRecords(attList);
      setStudents(stuRes.content);

      // Initialize manual marks
      const initialMarks: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
      stuRes.content.forEach((s) => {
        const att = attList.find((a) => a.studentId === s.id);
        initialMarks[s.id] = att ? att.status : 'ABSENT';
      });
      setManualMarks(initialMarks);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [sessionIdParam]);

  // Camera Management
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    if (activeTab === 'FACE') {
      const startCam = async () => {
        setCameraPermissionError(null);
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Webcam API is not supported in this environment');
          }
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        } catch (err: any) {
          setCameraActive(false);
          setCameraPermissionError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in your browser settings to perform live face sweeps, or switch to QR/Manual mode.'
              : 'Webcam device not available or blocked by browser permissions.'
          );
        }
      };
      startCam();
    } else {
      setCameraActive(false);
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab]);

  // QR Refresh Timer (25 seconds)
  useEffect(() => {
    let interval: any = null;

    if (activeTab === 'QR' && session?.status === 'OPEN') {
      const fetchQr = async () => {
        try {
          const res = await api.sessions.getQr(sessionIdParam);
          setQrToken(res.token);
          setQrTimeLeft(res.expiresIn || 25);
        } catch {
          // fallback
        }
      };

      fetchQr();

      interval = setInterval(() => {
        setQrTimeLeft((prev) => {
          if (prev <= 1) {
            fetchQr();
            return 25;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, session?.status, sessionIdParam]);

  // Capture & Recognise Face
  const handleCaptureAndRecognize = async () => {
    setIsRecognizing(true);
    try {
      // Simulate frame capture from canvas or direct payload
      const dummyFrame = 'data:image/jpeg;base64,camera_frame_mock_tensor';
      const result = await api.attendance.face(sessionIdParam, dummyFrame);

      setLastRecognitionResult(result);
      toast.success(
        `Recognized ${result.recognisedCount} student(s) with verified liveness. ${
          result.suspectedSpoofs > 0 ? `(${result.suspectedSpoofs} spoof warning enqueued)` : ''
        }`
      );
      // Refresh attendance records
      await loadSessionData();
    } catch (err: any) {
      toast.error(err.message || 'Face recognition service failed');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Manual Mode Actions
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENT';
    });
    setManualMarks(updated);
    toast.info('Marked all students as Present. Click Submit to save changes.');
  };

  const handleManualMarkChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setManualMarks((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleBulkSubmit = async () => {
    setIsSubmittingBulk(true);
    try {
      const payload = Object.entries(manualMarks).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await api.attendance.bulk(sessionIdParam, payload);
      toast.success('Bulk attendance roster synchronized successfully.');
      await loadSessionData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit bulk attendance');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Close Session
  const handleCloseSession = async () => {
    setIsClosing(true);
    try {
      await api.sessions.close(sessionIdParam);
      toast.success('Session finalized. Absent students were automatically marked and recorded.');
      setIsCloseModalOpen(false);
      await loadSessionData();
      navigate('/teacher/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to close session');
    } finally {
      setIsClosing(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const totalCount = students.length || session?.totalStudents || 8;

  return (
    <div className="space-y-6">
      {/* Session Title & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {session?.subjectCode}: {session?.subjectName}
            </h1>
            <StatusBadge status={session?.status || 'OPEN'} />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Room {session?.roomCode}</span>
            <span>·</span>
            <span>Section {session?.sectionName}</span>
            <span>·</span>
            <span className="font-mono">{session?.startTime} - {session?.endTime}</span>
            <span>·</span>
            <span>Date: {session?.date}</span>
          </div>
        </div>

        {/* Live Attendance Counter & Close Session Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Live Attendance
            </span>
            <div className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              <span className="text-emerald-600 dark:text-emerald-400">{presentCount}</span>
              <span className="text-slate-400"> / {totalCount}</span>
            </div>
          </div>

          {session?.status === 'OPEN' && (
            <button
              onClick={() => setIsCloseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 rounded-md transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              Close Session
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('FACE')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'FACE'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Face AI Sweep
          </button>

          <button
            onClick={() => setActiveTab('QR')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'QR'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Dynamic QR Broadcast
          </button>

          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'MANUAL'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Manual Roster
          </button>
        </div>
      </div>

      {/* Mode Contents */}
      {activeTab === 'FACE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Webcam Viewport & Trigger */}
          <div className="lg:col-span-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative shadow-md">
            <div className="aspect-video w-full relative flex items-center justify-center bg-black">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="p-6 text-center text-slate-400 max-w-sm">
                  <VideoOff className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">
                    {cameraPermissionError ? 'Camera Disabled' : 'Connecting to Classroom Video Feed...'}
                  </p>
                  {cameraPermissionError && (
                    <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                      {cameraPermissionError}
                    </p>
                  )}
                </div>
              )}

              {/* Overlaid Face HUD Reticle */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-sky-400/60 rounded-xl relative animate-pulse">
                    <span className="absolute -top-3 left-4 px-1.5 py-0.5 bg-sky-950/80 text-sky-400 font-mono text-[10px] rounded">
                      FACE DETECTION TENSOR
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Anti-spoof liveness enabled (ISO/IEC 30107-3)</span>
              </div>

              <button
                onClick={handleCaptureAndRecognize}
                disabled={isRecognizing}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 rounded-md shadow-xs transition-colors"
              >
                {isRecognizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Frames...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture & Recognise</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recognized Students Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Face Match Feed
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Threshold: 85%
                </span>
              </div>

              {lastRecognitionResult ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Students recognized:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {lastRecognitionResult.recognisedCount}
                      </span>
                    </div>
                    {lastRecognitionResult.suspectedSpoofs > 0 && (
                      <div className="flex justify-between font-medium text-amber-600 dark:text-amber-400 mt-1">
                        <span>Liveness anomaly:</span>
                        <span className="font-mono font-bold">
                          {lastRecognitionResult.suspectedSpoofs} (Enqueued to review)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {lastRecognitionResult.students.map((st) => (
                      <div key={st.studentId} className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {st.studentRoll}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {st.confidenceScore}%
                          </span>
                          <div className="mt-0.5">
                            <StatusBadge status={st.livenessStatus} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  Click <strong>Capture & Recognise</strong> to sweep the lecture room and identify attending students.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('/teacher/review-queue')}
                className="w-full py-1.5 text-xs text-center text-sky-600 dark:text-sky-400 hover:underline"
              >
                Inspect Face Review Queue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Mode */}
      {activeTab === 'QR' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Dynamic Rotating QR Code
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
            Project this screen on the classroom monitor. Students scan using their AcuAttend student mobile portal.
          </p>

          {/* Large Simulated SVG QR Code Box */}
          <div className="relative p-6 bg-white border-4 border-slate-900 rounded-2xl shadow-lg">
            <svg
              className="w-56 h-56 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner position markers */}
              <rect x="0" y="0" width="28" height="28" fill="black" />
              <rect x="4" y="4" width="20" height="20" fill="white" />
              <rect x="8" y="8" width="12" height="12" fill="black" />

              <rect x="72" y="0" width="28" height="28" fill="black" />
              <rect x="76" y="4" width="20" height="20" fill="white" />
              <rect x="80" y="8" width="12" height="12" fill="black" />

              <rect x="0" y="72" width="28" height="28" fill="black" />
              <rect x="4" y="76" width="20" height="20" fill="white" />
              <rect x="8" y="80" width="12" height="12" fill="black" />

              {/* Data pixel matrix blocks */}
              <rect x="36" y="8" width="8" height="8" fill="black" />
              <rect x="52" y="12" width="12" height="6" fill="black" />
              <rect x="32" y="24" width="6" height="6" fill="black" />
              <rect x="44" y="28" width="16" height="8" fill="black" />
              <rect x="64" y="20" width="6" height="14" fill="black" />

              <rect x="8" y="36" width="14" height="6" fill="black" />
              <rect x="28" y="40" width="8" height="8" fill="black" />
              <rect x="44" y="44" width="12" height="12" fill="black" />
              <rect x="64" y="40" width="12" height="6" fill="black" />
              <rect x="84" y="36" width="10" height="8" fill="black" />

              <rect x="12" y="52" width="8" height="12" fill="black" />
              <rect x="28" y="56" width="8" height="8" fill="black" />
              <rect x="72" y="56" width="20" height="8" fill="black" />

              <rect x="36" y="68" width="16" height="6" fill="black" />
              <rect x="60" y="72" width="8" height="12" fill="black" />
              <rect x="36" y="84" width="8" height="8" fill="black" />
              <rect x="52" y="80" width="12" height="14" fill="black" />
              <rect x="72" y="88" width="16" height="8" fill="black" />
            </svg>

            <div className="mt-3 font-mono text-[10px] text-slate-500 tracking-wider truncate max-w-[220px]">
              {qrToken}
            </div>
          </div>

          {/* Countdown Ring Indicator */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-200 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (qrTimeLeft / 25) * 100}
                  className="text-sky-500 transition-all duration-1000 ease-linear"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {qrTimeLeft}s
              </span>
            </div>

            <div className="text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Auto-rotates in {qrTimeLeft} seconds
              </p>
              <p className="text-[11px] text-slate-400">
                Prevents photo sharing & proxy check-ins
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      {activeTab === 'MANUAL' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Classroom Attendance Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toggle individual attendance statuses or mark all enrolled students at once.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Mark All Present
              </button>

              <button
                onClick={handleBulkSubmit}
                disabled={isSubmittingBulk}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
              >
                {isSubmittingBulk ? 'Saving...' : 'Save Roster (POST /bulk)'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((st) => {
              const currentStatus = manualMarks[st.id] || 'ABSENT';
              return (
                <div
                  key={st.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {st.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {st.studentId}
                      </span>
                      {st.faceEnrolled && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                          Biometrics Enrolled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Term Attendance: {st.overallAttendancePercentage.toFixed(1)}%
                    </p>
                  </div>

                  {/* Segmented status buttons */}
                  <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((stat) => {
                      const isSelected = currentStatus === stat;
                      let activeStyle = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold';
                      if (stat === 'PRESENT' && isSelected) activeStyle = 'bg-emerald-600 text-white shadow-2xs font-bold';
                      if (stat === 'ABSENT' && isSelected) activeStyle = 'bg-rose-600 text-white shadow-2xs font-bold';
                      if (stat === 'LATE' && isSelected) activeStyle = 'bg-amber-600 text-white shadow-2xs font-bold';

                      return (
                        <button
                          key={stat}
                          onClick={() => handleManualMarkChange(st.id, stat)}
                          className={`px-2.5 py-1 text-xs rounded-sm transition-colors text-[11px] ${
                            isSelected
                              ? activeStyle
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {stat.charAt(0) + stat.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Close Session Confirm Dialog */}
      <ConfirmDialog
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseSession}
        title="Finalize & Close Session"
        message="Are you sure you want to close this attendance window? Any students who have not checked in via Face, QR, or Manual roster will be automatically marked as ABSENT in the official collegiate ledger."
        confirmText="Confirm & Auto-Mark Absentees"
        isDestructive={true}
        isLoading={isClosing}
      />
    </div>
  );
};
