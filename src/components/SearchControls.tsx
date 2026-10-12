import React, { useState, useRef } from 'react';
import { Search, Camera, Upload, RefreshCw, X, Shield, Sparkles, Video, CheckCircle2 } from 'lucide-react';

interface SearchControlsProps {
  activeTab: 'bib' | 'face';
  onChangeTab: (tab: 'bib' | 'face') => void;
  bibQuery: string;
  onBibChange: (bib: string) => void;
  onSelfieUpload: (file: File | null, base64?: string, matchBibHint?: string) => void;
  isSearchingFace: boolean;
  activeBibs: string[];
  totalPhotosCount: number;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  activeTab,
  onChangeTab,
  bibQuery,
  onBibChange,
  onSelfieUpload,
  isSearchingFace,
  activeBibs,
  totalPhotosCount,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada peramban Anda.');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setSelfiePreview(dataUrl);
    stopCamera();
    onSelfieUpload(null, dataUrl);
  };

  // Handle file drop / select
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelfiePreview(dataUrl);
      onSelfieUpload(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelfie = () => {
    setSelfiePreview(null);
    onSelfieUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preset demo selfies
  const demoSelfies = [
    { label: 'Bib #101 (Rian)', bib: '101', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=300&q=80' },
    { label: 'Bib #204 (Budi)', bib: '204', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80' },
    { label: 'Bib #312 (Maya)', bib: '312', img: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=300&q=80' },
    { label: 'Bib #777 (Dewi)', bib: '777', img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden items-center p-1 bg-neutral-950 rounded-xl mb-4 border border-neutral-800">
          <button
            onClick={() => onChangeTab('bib')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bib' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-orange-500" />
            Nomor BIB (OCR)
          </button>
          <button
            onClick={() => onChangeTab('face')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'face' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-orange-500" />
            Pencarian Selfie
          </button>
        </div>

        {/* TAB 1: BIB SEARCH */}
        {activeTab === 'bib' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nomor bib dada (misal: 101, 204, 312)..."
                  value={bibQuery}
                  onChange={(e) => onBibChange(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-10 py-3 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                />
                {bibQuery && (
                  <button
                    onClick={() => onBibChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {bibQuery && (
                <button
                  onClick={() => onBibChange('')}
                  className="px-4 py-3 text-xs font-mono font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors whitespace-nowrap"
                >
                  Tampilkan Semua ({totalPhotosCount})
                </button>
              )}
            </div>

            {/* Quick Bib Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500 font-mono text-[11px]">BIB Terdeteksi:</span>
              {activeBibs.slice(0, 8).map((bib) => (
                <button
                  key={bib}
                  onClick={() => onBibChange(bib)}
                  className={`px-2.5 py-1 rounded-lg font-mono transition-all text-xs ${
                    bibQuery === bib
                      ? 'bg-orange-600 text-white font-bold ring-2 ring-orange-500/50'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  #{bib}
                </button>
              ))}
              {bibQuery && (
                <span className="text-neutral-400 font-mono text-[11px] ml-auto">
                  Menampilkan hasil untuk bib <strong className="text-orange-400 font-mono">#{bibQuery}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SELFIE FACE SEARCH */}
        {activeTab === 'face' && (
          <div className="space-y-4">
            
            {/* Camera View Modal / Inline */}
            {cameraActive ? (
              <div className="relative bg-black rounded-2xl overflow-hidden border border-neutral-700 max-w-md mx-auto aspect-square flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Face Guide Oval */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-72 border-2 border-dashed border-orange-400/80 rounded-[50%] animate-pulse" />
                </div>

                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4 z-10">
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium backdrop-blur-md"
                  >
                    Batal
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil Foto
                  </button>
                </div>
              </div>
            ) : selfiePreview ? (
              /* Active Selfie Selected View */
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-orange-500 shadow-md shrink-0">
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                  <button
                    onClick={handleClearSelfie}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selfie Berhasil Diunggah & Diproses</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Sistem sedang membandingkan vektor wajah 512-dimensi dengan seluruh foto event.
                  </p>
                  <div className="text-[11px] font-mono text-neutral-500">
                    Ambang kecocokan minimum: 0.40 (FACE_THRESHOLD)
                  </div>
                </div>

                <button
                  onClick={handleClearSelfie}
                  className="px-3.5 py-2 text-xs font-mono text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
                >
                  Ganti Selfie
                </button>
              </div>
            ) : (
              /* Upload / Camera Dropzone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  dragOver
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Unggah Foto Selfie atau Ambil dari Kamera
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      AI mencocokkan struktur wajah Anda dengan ribuan foto di lintasan maraton.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors border border-neutral-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-neutral-300" />
                      Pilih Foto dari Galeri
                    </button>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-md shadow-orange-600/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Buka Kamera Depan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Demo Selfie Matchers */}
            {!selfiePreview && !cameraActive && (
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    Uji Cepat Demo Pencarian Wajah Pelari:
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {demoSelfies.map((demo) => (
                    <button
                      key={demo.bib}
                      onClick={() => {
                        setSelfiePreview(demo.img);
                        onSelfieUpload(null, demo.img, demo.bib);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 transition-colors text-left"
                    >
                      <img
                        src={demo.img}
                        alt={demo.label}
                        className="w-8 h-8 rounded-md object-cover border border-neutral-700"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-neutral-200 truncate">{demo.label}</div>
                        <div className="text-[9px] text-orange-400 font-mono">Uji Wajah & Bib</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy note as mandated by Indonesian PDP & README */}
            <div className="flex items-start gap-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privasi & UU PDP:</strong> Foto selfie diubah menjadi embedding numerik di memori sementara dan tidak disimpan ke server. Data biometrik langsung dibersihkan setelah hasil pencarian selesai.
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
