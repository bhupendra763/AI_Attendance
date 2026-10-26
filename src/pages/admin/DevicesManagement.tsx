import React, { useState, useEffect } from 'react';
import { api } from '../../api/endpoints';
import { Device, Room } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  Camera,
  RotateCw,
  Plus,
  Key,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const DevicesManagement: React.FC = () => {
  const toast = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Register Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: 'CAMERA' as 'CAMERA' | 'KIOSK' | 'GATEWAY',
    roomId: 'room-lh101',
    ipAddress: '192.168.10.50',
    macAddress: 'B8:27:EB:AA:11:22',
  });

  // Secret API Key Dialog (Show Once!)
  const [rawSecretKey, setRawSecretKey] = useState<string | null>(null);
  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const [devList, rmList] = await Promise.all([
        api.devices.list(),
        api.rooms.list(),
      ]);
      setDevices(devList);
      setRooms(rmList);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.devices.create(deviceForm);
      toast.success('Hardware device registered.');
      setIsRegisterOpen(false);
      setRawSecretKey(res.rawApiKey);
      setIsSecretDialogOpen(true);
      await fetchDevices();
    } catch {
      toast.error('Device registration failed');
    }
  };

  const handleRotateKey = async (deviceId: string) => {
    try {
      const res = await api.devices.rotateKey(deviceId);
      toast.success('Cryptographic API key rotated.');
      setRawSecretKey(res.rawApiKey);
      setIsSecretDialogOpen(true);
      await fetchDevices();
    } catch {
      toast.error('Key rotation failed');
    }
  };

  const handleCopyKey = () => {
    if (!rawSecretKey) return;
    navigator.clipboard.writeText(rawSecretKey);
    setCopied(true);
    toast.success('API Secret Key copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const columns: Column<Device>[] = [
    {
      key: 'name',
      header: 'Device Identifier',
      accessor: (d) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-white">{d.name}</p>
          <span className="font-mono text-[11px] text-slate-400">
            {d.macAddress} · Firmware: {d.firmwareVersion}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Device Type',
      accessor: (d) => (
        <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
          {d.type}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'roomCode',
      header: 'Location',
      accessor: (d) => <span className="font-bold text-xs">{d.roomCode}</span>,
      sortable: true,
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      accessor: (d) => <span className="font-mono text-xs">{d.ipAddress}</span>,
    },
    {
      key: 'apiKeyMasked',
      header: 'API Credential',
      accessor: (d) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500">{d.apiKeyMasked}</span>
          <button
            onClick={() => handleRotateKey(d.id)}
            className="p-1 text-slate-400 hover:text-sky-500"
            title="Rotate API Key"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Connectivity',
      accessor: (d) => <StatusBadge status={d.status} size="sm" />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edge Cameras & Kiosks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enroll ceiling vision sensors, tablet check-in stations, and manage API keys.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hardware Device</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={devices}
        isLoading={isLoading}
        searchPlaceholder="Filter devices by name, IP, or location..."
      />

      {/* Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Edge Camera or Kiosk"
        description="Deploy hardware to an academic room and generate an ingestion credential."
      >
        <form onSubmit={handleRegisterDevice} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">Device Label</label>
            <input
              type="text"
              required
              placeholder="e.g. Lecture Hall 101 Ceiling Rig"
              value={deviceForm.name}
              onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Device Category</label>
              <select
                value={deviceForm.type}
                onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              >
                <option value="CAMERA">CAMERA (Ceiling AI)</option>
                <option value="KIOSK">KIOSK (Tablet Entryway)</option>
                <option value="GATEWAY">GATEWAY (Edge Node)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Installed Room</label>
              <select
                value={deviceForm.roomId}
                onChange={(e) => setDeviceForm({ ...deviceForm, roomId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} ({r.building})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Static IP Address</label>
              <input
                type="text"
                required
                value={deviceForm.ipAddress}
                onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">MAC Address</label>
              <input
                type="text"
                required
                value={deviceForm.macAddress}
                onChange={(e) => setDeviceForm({ ...deviceForm, macAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-md font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
            >
              Register & Generate Key
            </button>
          </div>
        </form>
      </Modal>

      {/* Show API Key ONCE Dialog */}
      <Modal
        isOpen={isSecretDialogOpen}
        onClose={() => setIsSecretDialogOpen(false)}
        title="Device Authentication Key"
        description="Copy this secret key immediately. For security reasons, it will never be displayed again in plaintext."
        maxWidth="md"
        footer={
          <button
            onClick={() => setIsSecretDialogOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 rounded-md"
          >
            I have securely saved this key
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300">
            Configure this key on the camera edge daemon configuration file (<code>/etc/acuattend/agent.conf</code>).
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all flex-1">
              {rawSecretKey}
            </span>
            <button
              onClick={handleCopyKey}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
