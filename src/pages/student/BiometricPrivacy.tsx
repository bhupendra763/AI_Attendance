import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Trash2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  VideoOff,
  Sparkles,
} from 'lucide-react';

export const BiometricPrivacy: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [consentGranted, setConsentGranted] = useState(true);
  const [faceEnrolled, setFaceEnrolled] = useState(true);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [isProcessingConsent, setIsProcessingConsent] = useState(false);

  // Enrollment Wizard state
  const [wizardActive, setWizardActive] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isSavingEnrollment, setIsSavingEnrollment] = useState(false);

  // Webcam stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const wizardPrompts = [
    { title: 'Step 1: Look Straight Ahead', instruction: 'Align your face inside the central oval frame under even lighting.' },
    { title: 'Step 2: Turn Head Slightly Left', instruction: 'Slowly tilt your head 20 degrees to the left for side profile triangulation.' },
    { title: 'Step 3: Turn Head Slightly Right', instruction: 'Now turn 20 degrees to your right to capture contralateral contours.' },
    { title: 'Step 4: Neutral Expression & Smile', instruction: 'Hold a relaxed, neutral facial expression for final mesh encoding.' },
  ];

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (wizardActive) {
      const startCam = async () => {
        setCameraError(null);
        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Webcam not supported');
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        } catch (err: any) {
          setCameraActive(false);
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow access in browser settings to enroll your face.'
              : 'Webcam not accessible.'
          );
        }
      };
      startCam();
    } else {
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [wizardActive]);

  const handleCaptureFrame = () => {
    // Capture snapshot simulation
    const frameMock = `data:image/jpeg;base64,mock_frame_${wizardStep}_${Date.now()}`;
    const nextFrames = [...capturedFrames, frameMock];
    setCapturedFrames(nextFrames);

    if (wizardStep < wizardPrompts.length - 1) {
      setWizardStep((prev) => prev + 1);
      toast.info(`Frame ${wizardStep + 1} of ${wizardPrompts.length} recorded.`);
    } else {
      toast.success('All 4 facial poses acquired! Ready to generate biometric embedding.');
    }
  };

  const handleFinalizeEnrollment = async () => {
    if (!user) return;
    setIsSavingEnrollment(true);
    try {
      await api.faces.enroll(user.id, capturedFrames);
      setFaceEnrolled(true);
      setConsentGranted(true);
      setWizardActive(false);
      setWizardStep(0);
      setCapturedFrames([]);
      toast.success('Biometric facial model generated and encrypted with AES-256 GCM.');
    } catch (err: any) {
      toast.error(err.message || 'Face enrollment failed');
    } finally {
      setIsSavingEnrollment(false);
    }
  };

  const handleRevokeConsent = async () => {
    if (!user) return;
    setIsProcessingConsent(true);
    try {
      await api.consents.revoke(user.id);
      await api.faces.delete(user.id);
      setConsentGranted(false);
      setFaceEnrolled(false);
      setIsRevokeConfirmOpen(false);
      toast.success('Biometric consent revoked and all facial embedding vectors purged permanently.');
    } catch (err: any) {
      toast.error(err.message || 'Revocation failed');
    } finally {
      setIsProcessingConsent(false);
    }
  };

  const handleGrantConsent = async () => {
    if (!user) return;
    setIsProcessingConsent(true);
    try {
      await api.consents.grant(user.id);
      setConsentGranted(true);
      toast.success('Biometric consent granted. You can now proceed with the Face Enrollment Wizard.');
    } catch {
      toast.error('Could not grant consent');
    } finally {
      setIsProcessingConsent(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Biometric Privacy, Consent & Face Enrollment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          FERPA & GDPR compliant student biometric management. You retain absolute control over your facial models.
        </p>
      </div>

      {/* Consent Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                consentGranted
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {consentGranted ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Facial Recognition Consent Status
                </h2>
                <StatusBadge status={consentGranted ? 'ACTIVE' : 'LOCKED'} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                {consentGranted
                  ? 'Your formal consent is recorded. AcuAttend is authorized to process classroom camera sweeps for automatic lecture attendance.'
                  : 'Consent is currently revoked. Classroom cameras will ignore your face; you must use QR or manual roll call.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {consentGranted ? (
              <button
                onClick={() => setIsRevokeConfirmOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md transition-colors"
              >
                Revoke Consent & Purge
              </button>
            ) : (
              <button
                onClick={handleGrantConsent}
                disabled={isProcessingConsent}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
              >
                Grant Biometric Consent
              </button>
            )}
          </div>
        </div>

        {/* Enrollment Status Sub-card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Biometric 3D Vector Template: {faceEnrolled ? 'Active & Enrolled' : 'Not Enrolled'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {faceEnrolled
                ? '512-dimension face embedding stored securely with zero raw photo retention.'
                : 'No template on file. Enroll now using your webcam.'}
            </span>
          </div>

          {consentGranted && (
            <button
              onClick={() => {
                setWizardActive(true);
                setWizardStep(0);
                setCapturedFrames([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{faceEnrolled ? 'Re-Enroll Face' : 'Launch Enrollment Wizard'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Face Enrollment Wizard */}
      {wizardActive && (
        <div className="bg-white dark:bg-slate-900 border-2 border-sky-500/40 rounded-xl p-6 shadow-lg space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-sky-500 font-semibold uppercase tracking-wider">
                Guided Enrollment Wizard
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {wizardPrompts[wizardStep].title}
              </h3>
            </div>

            <button
              onClick={() => setWizardActive(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {wizardPrompts[wizardStep].instruction}
          </p>

          {/* Camera Viewport with Oval Guidance Frame */}
          <div className="relative aspect-video max-w-md mx-auto bg-black rounded-lg overflow-hidden border border-slate-700 shadow-md flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="p-4 text-slate-400 text-xs text-center">
                <VideoOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>{cameraError || 'Connecting camera...'}</p>
              </div>
            )}

            {/* Oval HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-60 border-2 border-dashed border-sky-400 rounded-[50%] opacity-75" />
            </div>

            {/* Step Counter Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white font-mono text-xs px-2.5 py-1 rounded-md">
              Pose {wizardStep + 1} of {wizardPrompts.length}
            </div>
          </div>

          {/* Captured Thumbnails Preview */}
          <div className="flex items-center justify-center gap-3">
            {wizardPrompts.map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono transition-all ${
                  capturedFrames[i]
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold'
                    : i === wizardStep
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {capturedFrames[i] ? <CheckCircle2 className="w-5 h-5" /> : `P${i + 1}`}
              </div>
            ))}
          </div>

          {/* Wizard Action Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setWizardStep(0);
                setCapturedFrames([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset Poses
            </button>

            {capturedFrames.length < wizardPrompts.length ? (
              <button
                onClick={handleCaptureFrame}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-md shadow-xs transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Pose {wizardStep + 1}</span>
              </button>
            ) : (
              <button
                onClick={handleFinalizeEnrollment}
                disabled={isSavingEnrollment}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSavingEnrollment ? 'Encrypting Vector...' : 'Save & Encrypt Biometrics'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Revoke Warning Dialog */}
      <ConfirmDialog
        isOpen={isRevokeConfirmOpen}
        onClose={() => setIsRevokeConfirmOpen(false)}
        onConfirm={handleRevokeConsent}
        title="Revoke Biometric Consent & Permanently Purge Model"
        message="Warning: This action will permanently erase your 512-dimensional facial recognition vectors from collegiate AI edge nodes and databases. You will be excluded from automated overhead camera sweeps and must present manual or QR credentials for all subsequent classes."
        confirmText="Permanently Purge Biometrics"
        isDestructive={true}
        isLoading={isProcessingConsent}
      />
    </div>
  );
};
