import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  CheckCircle,
  Clock,
  Shield,
  Sliders,
  AlertTriangle,
  Plus,
  Send,
  MessageSquare,
  Copy,
  ExternalLink,
  Camera,
  FolderOpen,
} from 'lucide-react';
import {
  EventItem,
  PhotoItem,
  OrderItem,
  EventStatus,
  AppSettings,
} from '../types';
import {
  DEFAULT_ADMIN_KEY,
  getAdminStatus,
  getAdminOrders,
  markOrderPaid,
  deletePhoto,
  updatePhotoBib,
  createAdminEvent,
  uploadAdminPhotos,
  getAdminSettings,
  updateAdminSettings,
  getPhotos,
} from '../lib/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventItem;
  events: EventItem[];
  onRefreshEvents: () => void;
  onRefreshPhotos: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentEvent,
  events,
  onRefreshEvents,
  onRefreshPhotos,
}) => {
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem('fotolari_admin_key') || DEFAULT_ADMIN_KEY
  );
  const [activeTab, setActiveTab] = useState<
    'upload' | 'status' | 'orders' | 'photos' | 'events' | 'calibration'
  >('upload');

  // Status state
  const [statusData, setStatusData] = useState<EventStatus>({
    total: 0,
    pending: 0,
    processing: 0,
    done: 0,
    failed: 0,
  });

  // Orders state
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [paidResultModal, setPaidResultModal] = useState<{
    token: string;
    url: string;
    waText: string;
    orderNum: string;
  } | null>(null);

  // Photos state
  const [adminPhotos, setAdminPhotos] = useState<PhotoItem[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);
  const [editingBib, setEditingBib] = useState('');

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Create Event state
  const [newEventModal, setNewEventModal] = useState(false);
  const [newEvName, setNewEvName] = useState('Jambi Run 10K 2026');
  const [newEvDate, setNewEvDate] = useState('2026-10-12');
  const [newEvPrice, setNewEvPrice] = useState('15000');
  const [newEvLocation, setNewEvLocation] = useState('Jambi, Indonesia');

  // Calibration state
  const [settings, setSettings] = useState<AppSettings>({
    admin_key: adminKey,
    face_threshold: 0.40,
    ocr_min_conf: 0.45,
    organizer_wa: '6281274567890',
    bank_details: 'BCA: 1234-5678-90 a.n. ombo.id Official',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Save admin key to storage
  const handleKeyChange = (val: string) => {
    setAdminKey(val);
    localStorage.setItem('fotolari_admin_key', val);
  };

  // Fetch status
  const refreshStatus = async () => {
    try {
      const data = await getAdminStatus(currentEvent.id, adminKey);
      setStatusData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat status pemrosesan foto');
    }
  };

  // Fetch orders
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders(adminKey);
      setOrdersList(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Fetch photos
  const refreshPhotoList = async () => {
    try {
      const data = await getPhotos(currentEvent.id);
      setAdminPhotos(data.photos);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Fetch settings
  const refreshSettings = async () => {
    try {
      const data = await getAdminSettings(adminKey);
      setSettings(data);
    } catch (err) {
      // Keep default
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      refreshOrders();
      refreshPhotoList();
      refreshSettings();

      // Poll status every 4 seconds for background processing monitor
      const interval = setInterval(() => {
        refreshStatus();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentEvent.id, adminKey]);

  // Mark order paid
  const handleMarkPaid = async (orderId: number) => {
    try {
      const res = await markOrderPaid(orderId, adminKey);
      setPaidResultModal({
        token: res.download_token,
        url: res.download_url,
        waText: res.wa_reply_text,
        orderNum: `ORD-#${orderId}`,
      });
      refreshOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal menandai lunas');
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm(`Hapus foto #${photoId} dari database dan penyimpanan?`)) return;
    try {
      await deletePhoto(photoId, adminKey);
      refreshPhotoList();
      refreshStatus();
      onRefreshPhotos();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus foto');
    }
  };

  // Update Bib
  const handleSaveBib = async (photoId: number) => {
    try {
      await updatePhotoBib(photoId, editingBib, adminKey);
      setEditingPhotoId(null);
      refreshPhotoList();
      onRefreshPhotos();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah bib');
    }
  };

  // Upload photos
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    try {
      setIsUploading(true);
      setErrorMsg('');
      setUploadSuccessMsg('');

      const res = await uploadAdminPhotos(currentEvent.id, uploadFiles, adminKey);
      setUploadSuccessMsg(res.message || 'Foto berhasil diunggah!');
      setUploadFiles([]);
      refreshStatus();
      refreshPhotoList();
      onRefreshPhotos();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  // Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminEvent(
        {
          name: newEvName,
          event_date: newEvDate,
          price: Number(newEvPrice),
          location: newEvLocation,
        },
        adminKey
      );
      setNewEventModal(false);
      onRefreshEvents();
      alert('Event baru berhasil dibuat!');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat event');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings, adminKey);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ombo.id logo" className="w-8 h-8 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">ombo.id Admin Dashboard</h2>
                <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                  {currentEvent.name}
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                OCR Bib · Face Embeddings · WhatsApp Orders · Token Issuing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Key Input */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-mono text-neutral-400">X-Admin-Key:</span>
              <input
                type="text"
                value={adminKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="isi-ADMIN_KEY-kamu"
                className="bg-transparent text-xs font-mono text-orange-400 focus:outline-none w-36"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Status Progress Bar */}
        <div className="bg-neutral-950/60 border-b border-neutral-800 px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">Status Pemrosesan Latar Belakang:</span>
              <span className="text-white font-bold">{statusData.total} Total Foto</span>
              <span className="text-yellow-400">{statusData.pending} Pending</span>
              <span className="text-blue-400">{statusData.processing} Processing (OCR/ML)</span>
              <span className="text-emerald-400">{statusData.done} Done</span>
              {statusData.failed > 0 && <span className="text-red-400">{statusData.failed} Failed</span>}
            </div>

            <button
              onClick={refreshStatus}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Perbarui Status
            </button>
          </div>

          {/* Progress bar visual */}
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2 flex">
            <div
              style={{ width: `${statusData.total ? (statusData.done / statusData.total) * 100 : 0}%` }}
              className="bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${statusData.total ? (statusData.processing / statusData.total) * 100 : 0}%` }}
              className="bg-blue-500 transition-all duration-500 animate-pulse"
            />
            <div
              style={{ width: `${statusData.total ? (statusData.pending / statusData.total) * 100 : 0}%` }}
              className="bg-yellow-500 transition-all duration-500"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-neutral-800 bg-neutral-950 flex gap-2 overflow-x-auto">
          {[
            { id: 'upload', label: 'Upload Foto Batch' },
            { id: 'orders', label: `Daftar Pesanan (${ordersList.length})` },
            { id: 'photos', label: `Kelola Foto & Bib (${adminPhotos.length})` },
            { id: 'events', label: 'Kelola Event' },
            { id: 'calibration', label: 'Kalibrasi & Konfigurasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* TAB 1: UPLOAD FOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Upload Foto Lari untuk "{currentEvent.name}"
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-lg mx-auto">
                    Foto yang diunggah akan otomatis diproses di latar belakang: deteksi nomor bib (OCR dada), pembuatan embedding wajah (512-dim), dan pembuatan preview ber-watermark dengan kredit fotografer terdaftar.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-[11px] font-mono text-orange-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Hanya fotografer terdaftar & admin yang diizinkan mempublikasikan foto</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <label className="cursor-pointer px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors">
                    <FolderOpen className="w-4 h-4 text-orange-400" />
                    Pilih File Foto (Boleh Banyak)
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="pt-3 border-t border-neutral-800 text-left space-y-2 max-w-lg mx-auto">
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                      <span>{uploadFiles.length} file dipilih siap upload</span>
                      <button onClick={() => setUploadFiles([])} className="text-red-400">Batal</button>
                    </div>
                    <div className="max-h-32 overflow-y-auto bg-neutral-900 rounded-xl p-2 space-y-1 text-xs font-mono text-neutral-300 border border-neutral-800">
                      {uploadFiles.map((f, i) => (
                        <div key={i} className="truncate">{f.name} ({(f.size / 1024).toFixed(0)} KB)</div>
                      ))}
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                    >
                      {isUploading ? 'Mengunggah & Memproses...' : `Mulai Upload & Antrekan Pemrosesan AI`}
                    </button>
                  </div>
                )}

                {uploadSuccessMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                    {uploadSuccessMsg}
                  </div>
                )}
              </div>

              {/* cURL instructions as documented in README */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs font-mono text-neutral-400 space-y-2">
                <span className="text-white font-bold text-xs">Atau gunakan cURL terminal sesuai README:</span>
                <pre className="bg-neutral-900 p-3 rounded-lg overflow-x-auto text-orange-300">
                  {`curl -X POST http://localhost:3000/admin/events/${currentEvent.id}/photos \\
  -H "X-Admin-Key: ${adminKey}" \\
  -F files=@foto1.jpg -F files=@foto2.jpg`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & WHATSAPP CONFIRMATION */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1 rounded-lg ${orderFilter === 'all' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'}`}
                  >
                    Semua ({ordersList.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('pending')}
                    className={`px-3 py-1 rounded-lg ${orderFilter === 'pending' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'}`}
                  >
                    Menunggu Pembayaran ({ordersList.filter(o => o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('paid')}
                    className={`px-3 py-1 rounded-lg ${orderFilter === 'paid' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'}`}
                  >
                    Lunas ({ordersList.filter(o => o.status === 'paid').length})
                  </button>
                </div>

                <button
                  onClick={refreshOrders}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {ordersList.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500 font-mono">
                  Belum ada pesanan masuk.
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersList
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">{ord.order_number}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                ord.status === 'paid'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                              }`}
                            >
                              {ord.status === 'paid' ? 'LUNAS ✅' : 'PENDING WA'}
                            </span>
                          </div>

                          <div className="text-neutral-300">
                            <strong>{ord.runner_name}</strong> · Telp/WA: <span className="font-mono">{ord.runner_phone}</span> {ord.runner_bib ? `· Bib #${ord.runner_bib}` : ''}
                          </div>

                          <div className="text-neutral-400 font-mono text-[11px]">
                            {ord.photo_ids.length} foto dipesan (ID: {ord.photo_ids.join(', ')}) · Total:{' '}
                            <strong className="text-orange-400">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ord.total_amount)}
                            </strong>
                          </div>

                          {ord.download_token && (
                            <div className="text-[11px] font-mono text-emerald-400 pt-1">
                              Token Unduhan: <code>{ord.download_token}</code>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {ord.status === 'pending' ? (
                            <button
                              onClick={() => handleMarkPaid(ord.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Tandai Lunas & Buat Token
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const dlUrl = `/download/${ord.download_token}`;
                                window.open(dlUrl, '_blank');
                              }}
                              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                              Buka Link Unduh
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTOS & BIB CORRECTION */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Daftar Foto Event (Total: {adminPhotos.length})</span>
                <span className="text-neutral-500 font-mono">Bisa edit manual nomor bib jika OCR meleset</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adminPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col p-2.5 gap-2"
                  >
                    <div className="relative aspect-[3/2] w-full rounded-lg overflow-hidden bg-neutral-900">
                      <img src={p.thumbnail_url || p.preview_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                        ID: #{p.id}
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      {editingPhotoId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingBib}
                            onChange={(e) => setEditingBib(e.target.value)}
                            placeholder="Nomor BIB"
                            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono w-24"
                          />
                          <button
                            onClick={() => handleSaveBib(p.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPhotoId(null)}
                            className="p-1 bg-neutral-800 text-neutral-400 rounded hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">
                            BIB: #{p.bib_number || 'None'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPhotoId(p.id);
                              setEditingBib(p.bib_number || '');
                            }}
                            className="text-neutral-400 hover:text-orange-400 transition-colors"
                            title="Edit Nomor BIB"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="text-[11px] text-neutral-400 font-mono truncate">
                        Conf OCR: {p.ocr_confidence ? `${Math.round(p.ocr_confidence * 100)}%` : '-'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 flex justify-end">
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        className="text-neutral-500 hover:text-red-400 text-xs font-mono flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EVENT MANAGEMENT */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Daftar Event Lari Aktif</span>
                <button
                  onClick={() => setNewEventModal(true)}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Event Baru
                </button>
              </div>

              <div className="space-y-3">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{ev.name}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {ev.event_date} · {ev.location || 'Indonesia'}
                      </p>
                      <span className="text-xs font-mono text-orange-400">
                        Harga: Rp {ev.price.toLocaleString('id-ID')} / foto
                      </span>
                    </div>

                    <div className="text-xs font-mono text-neutral-400">
                      ID: #{ev.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CALIBRATION & SYSTEM SETTINGS */}
          {activeTab === 'calibration' && (
            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-white">Kalibrasi Model & Ambang Deteksi</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Pengaturan parameter seperti diterangkan pada dokumentasi arsitektur ombo.id.
                </p>
              </div>

              {/* FACE_THRESHOLD */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-mono text-neutral-300 font-semibold">
                    FACE_THRESHOLD (Default: 0.40)
                  </label>
                  <span className="font-mono text-orange-400 font-bold">
                    {settings.face_threshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.75"
                  step="0.01"
                  value={settings.face_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, face_threshold: parseFloat(e.target.value) })
                  }
                  className="w-full accent-orange-500"
                />
                <p className="text-[11px] text-neutral-500">
                  Naikkan jika terlalu banyak foto orang lain muncul, turunkan jika foto pelari sendiri terlewat.
                </p>
              </div>

              {/* OCR_MIN_CONF */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-mono text-neutral-300 font-semibold">
                    OCR_MIN_CONF (Default: 0.45)
                  </label>
                  <span className="font-mono text-orange-400 font-bold">
                    {settings.ocr_min_conf.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.01"
                  value={settings.ocr_min_conf}
                  onChange={(e) =>
                    setSettings({ ...settings, ocr_min_conf: parseFloat(e.target.value) })
                  }
                  className="w-full accent-orange-500"
                />
                <p className="text-[11px] text-neutral-500">
                  Atur keseimbangan antara bib salah baca dan bib terlewat saat cropping area dada.
                </p>
              </div>

              {/* Admin WA Number */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-mono text-neutral-300 font-semibold">
                  Nomor WhatsApp Official Penerima Pesanan
                </label>
                <input
                  type="text"
                  value={settings.organizer_wa}
                  onChange={(e) => setSettings({ ...settings, organizer_wa: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              {/* Bank Details */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-mono text-neutral-300 font-semibold">
                  Rincian Rekening Pembayaran
                </label>
                <textarea
                  rows={3}
                  value={settings.bank_details}
                  onChange={(e) => setSettings({ ...settings, bank_details: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
              >
                Simpan Konfigurasi
              </button>

              {settingsSaved && (
                <span className="text-xs text-emerald-400 font-mono ml-3">
                  Pengaturan berhasil disimpan!
                </span>
              )}
            </form>
          )}

        </div>

      </div>

      {/* Paid Result Modal with WhatsApp Copy */}
      {paidResultModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                Pesanan Ditandai LUNAS!
              </div>
              <button onClick={() => setPaidResultModal(null)}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Token unduhan foto beresolusi asli telah dibuat. Kirimkan pesan konfirmasi ini kepada pembeli di WhatsApp:
            </p>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 whitespace-pre-wrap max-h-44 overflow-y-auto">
              {paidResultModal.waText}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paidResultModal.waText);
                  alert('Pesan balasan WhatsApp berhasil disalin!');
                }}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                Salin Teks WhatsApp
              </button>
              <button
                onClick={() => {
                  window.open(paidResultModal.url, '_blank');
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Tes Link Unduh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {newEventModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Buat Event Lari Baru</h3>
              <button onClick={() => setNewEventModal(false)}><X className="w-4 h-4 text-neutral-400" /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Nama Event *</label>
                <input
                  type="text"
                  required
                  value={newEvName}
                  onChange={(e) => setNewEvName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Tanggal Event (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={newEvDate}
                  onChange={(e) => setNewEvDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Harga per Foto (IDR) *</label>
                <input
                  type="number"
                  required
                  value={newEvPrice}
                  onChange={(e) => setNewEvPrice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={newEvLocation}
                  onChange={(e) => setNewEvLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewEventModal(false)}
                  className="px-3 py-2 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
