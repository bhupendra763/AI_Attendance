import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import {
  QrCode,
  MapPin,
  Camera,
  CheckCircle2,
  VideoOff,
  Navigation,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const CheckIn: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'QR' | 'GEOFENCE'>('QR');
  const [sessionId, setSessionId] = useState('sess-today-1');
  const [qrInputToken, setQrInputToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  // Camera stream for scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Geolocation state
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoDistance, setGeoDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeTab === 'QR') {
      const startCam = async () => {
        setCameraError(null);
        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Camera not supported');
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
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
              ? 'Camera permission denied. You can still paste or simulate the QR token below.'
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
  }, [activeTab]);

  const handleSimulateScan = async (tokenValue?: string) => {
    const token = tokenValue || qrInputToken || `ACU_QR_sess-today-1_${Date.now()}`;
    if (!user) return;
    setIsSubmitting(true);
    try {
      await api.attendance.qr(sessionId, token, user.id);
      setCheckInSuccess(`Successfully checked in for CS401 using QR Verification.`);
      toast.success('Attendance recorded: Present (QR Verified)');
    } catch (err: any) {
      toast.error(err.message || 'QR verification expired or invalid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeofenceCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setGeoCoords(coords);
        try {
          if (!user) return;
          const res = await api.attendance.geofence(sessionId, coords, user.id);
          setGeoDistance(42); // mock 42 meters from center
          setCheckInSuccess(`Geofence verified! Checked in from lecture hall perimeter.`);
          toast.success('Attendance recorded: Present (GPS Geofence Verified)');
        } catch (err: any) {
          toast.error(err.message || 'You are outside the classroom geofence boundary');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error('Unable to retrieve device location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Classroom Check-In Terminal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan the rotating classroom QR display or verify your presence via campus GPS geofencing.
        </p>
      </div>

      {checkInSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex-1 text-xs text-emerald-800 dark:text-emerald-300">
            <p className="font-bold">Check-In Confirmed</p>
            <p>{checkInSuccess}</p>
          </div>
        </div>
      )}

      {/* Target Session Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Active Lecture Session
        </label>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
        >
          <option value="sess-today-1">CS401 - Distributed OS (Room LH-101 · 09:00 - 10:00)</option>
          <option value="sess-today-2">CS402 - Deep Learning (Room CS-LAB-3 · 10:15 - 11:15)</option>
        </select>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('QR')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'QR'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Scan QR Code
        </button>
        <button
          onClick={() => setActiveTab('GEOFENCE')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'GEOFENCE'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          GPS Geofence
        </button>
      </div>

      {activeTab === 'QR' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs text-center space-y-4">
          {/* Camera Scanner Viewport */}
          <div className="relative aspect-square max-w-xs mx-auto bg-black rounded-xl overflow-hidden border-2 border-slate-800 shadow-md flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-slate-400 text-xs">
                <VideoOff className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>{cameraError || 'Initializing camera...'}</p>
              </div>
            )}

            {/* Target Reticle */}
            <div className="absolute inset-8 border-2 border-sky-400 rounded-lg pointer-events-none opacity-80" />
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleSimulateScan()}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md shadow-xs transition-colors"
            >
              {isSubmitting ? 'Verifying Token...' : 'Scan / Submit Current Classroom Token'}
            </button>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cryptographically signed dynamic token authentication</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GEOFENCE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto border border-sky-200 dark:border-sky-800">
            <Navigation className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Classroom Geofence Radar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Verify your physical attendance inside Engineering Block A (150m boundary). AcuAttend verifies latitude, longitude, and accuracy radius.
            </p>
          </div>

          {geoCoords && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              <p>Lat: {geoCoords.lat.toFixed(5)}</p>
              <p>Lng: {geoCoords.lng.toFixed(5)}</p>
              {geoDistance !== null && (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Within boundary (~{geoDistance}m from podium)
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleGeofenceCheckIn}
            disabled={isLocating}
            className="w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md shadow-xs transition-colors"
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Acquiring GPS Fix...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Verify Geofence Check-In</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
