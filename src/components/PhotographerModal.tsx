import React, { useState } from 'react';
import {
  X,
  Camera,
  LogIn,
  UserPlus,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  LogOut,
  FolderOpen,
  Image as ImageIcon,
  ShieldCheck,
  Instagram,
  Tag,
  Clock,
} from 'lucide-react';
import { PhotographerProfile, EventItem, PhotoItem } from '../types';
import { loginPhotographer, registerPhotographer, uploadAdminPhotos } from '../lib/api';

interface PhotographerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotographer: PhotographerProfile | null;
  onLoginSuccess: (photographer: PhotographerProfile, token: string) => void;
  onLogout: () => void;
  currentEvent: EventItem;
  onPhotosUploaded: () => void;
}

export const PhotographerModal: React.FC<PhotographerModalProps> = ({
  isOpen,
  onClose,
  currentPhotographer,
  onLoginSuccess,
  onLogout,
  currentEvent,
  onPhotosUploaded,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('ombo.jambi@gmail.com');
  const [loginPassword, setLoginPassword] = useState('fotolari2026');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInstagram, setRegInstagram] = useState('');
  const [regGear, setRegGear] = useState('Sony A7 IV · 70-200mm f/2.8 GM');

  // Upload inside portal
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const emailToUse = customEmail || loginEmail;
      const passToUse = customPass || loginPassword;

      const res = await loginPhotographer(emailToUse, passToUse);
      onLoginSuccess(res.photographer, res.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await registerPhotographer({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        instagram: regInstagram,
        gear: regGear,
      });
      onLoginSuccess(res.photographer, res.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  // Handle Upload Photos as Logged-In Photographer
  const handleUploadPhotos = async () => {
    if (uploadFiles.length === 0 || !currentPhotographer?.token) return;
    try {
      setIsUploading(true);
      setErrorMsg('');
      setUploadSuccessMsg('');

      const res = await uploadAdminPhotos(
        currentEvent.id,
        uploadFiles,
        undefined,
        currentPhotographer.token
      );

      setUploadSuccessMsg(res.message || 'Foto berhasil diunggah!');
      setUploadFiles([]);
      onPhotosUploaded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {currentPhotographer ? 'Portal Fotografer Resmi' : 'Masuk Fotografer Terdaftar'}
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                Hanya fotografer terdaftar yang berhak mengunggah foto ke ombo.id
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW 1: ALREADY LOGGED IN AS PHOTOGRAPHER */}
          {currentPhotographer ? (
            <div className="space-y-5">
              
              {/* Profile Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentPhotographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={currentPhotographer.name}
                    className="w-12 h-12 rounded-xl object-cover border border-orange-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{currentPhotographer.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        TERVERIFIKASI ✅
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      {currentPhotographer.gear || 'Kamera Pro'} {currentPhotographer.instagram ? `· ${currentPhotographer.instagram}` : ''}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">{currentPhotographer.email}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar Akun
                </button>
              </div>

              {/* Upload Zone for Logged-In Photographer */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Upload Foto Lari untuk Publikasi: "{currentEvent.name}"
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                    Foto yang diunggah akan diatribusikan ke profil <strong>{currentPhotographer.name}</strong>, diproses OCR bib otomatis, dan diberi watermark pelindung.
                  </p>
                </div>

                <div className="flex justify-center">
                  <label className="cursor-pointer px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-colors">
                    <FolderOpen className="w-4 h-4 text-orange-400" />
                    Pilih File Foto dari Komputer / Kamera
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
                  <div className="pt-3 border-t border-neutral-800 text-left space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                      <span>{uploadFiles.length} file dipilih</span>
                      <button onClick={() => setUploadFiles([])} className="text-red-400">Batal</button>
                    </div>
                    <div className="max-h-28 overflow-y-auto bg-neutral-900 rounded-xl p-2 space-y-1 text-xs font-mono text-neutral-300 border border-neutral-800">
                      {uploadFiles.map((f, i) => (
                        <div key={i} className="truncate">{f.name} ({(f.size / 1024).toFixed(0)} KB)</div>
                      ))}
                    </div>

                    <button
                      onClick={handleUploadPhotos}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                    >
                      {isUploading ? 'Mengunggah & Memproses AI...' : `Publikasikan ${uploadFiles.length} Foto Sekarang`}
                    </button>
                  </div>
                )}

                {uploadSuccessMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                    {uploadSuccessMsg}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* VIEW 2: LOGIN OR REGISTER FORM */
            <div className="space-y-5">
              
              {/* Tab Selector */}
              <div className="flex p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'login' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk Akun Fotografer
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'register' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Daftar Fotografer Baru
                </button>
              </div>

              {/* LOGIN TAB */}
              {mode === 'login' && (
                <div className="space-y-4">
                  <form onSubmit={(e) => handleLogin(e)} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Email Fotografer Terdaftar
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contoh: ombo.jambi@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Kata Sandi
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                    >
                      {loading ? 'Memverifikasi...' : 'Masuk & Buka Akses Upload'}
                    </button>
                  </form>

                  {/* 1-Click Demo Logins for Fast Testing */}
                  <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      Pilih Akun Fotografer Uji Coba Cepat:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLogin(undefined, 'ombo.jambi@gmail.com', 'fotolari2026')}
                        className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors"
                      >
                        <div className="text-xs font-bold text-white truncate">Ombo Jambi Media</div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate">Nikon Z9</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogin(undefined, 'fotografer@ombo.id', 'fotografer123')}
                        className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors"
                      >
                        <div className="text-xs font-bold text-white truncate">Budi Pratama Lens</div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate">Sony A7 IV</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogin(undefined, 'siti.lens@gmail.com', 'fotolari123')}
                        className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left transition-colors"
                      >
                        <div className="text-xs font-bold text-white truncate">Siti Runner Lens</div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate">Canon EOS R5</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTER TAB */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nama Lengkap Fotografer / Studio *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Andi Lensa Marathon"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Email Resmi *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="andi@gmail.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Kata Sandi *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Akun Instagram / Portofolio
                      </label>
                      <input
                        type="text"
                        value={regInstagram}
                        onChange={(e) => setRegInstagram(e.target.value)}
                        placeholder="@andiphoto"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Kamera & Lensa yang Digunakan *
                    </label>
                    <input
                      type="text"
                      required
                      value={regGear}
                      onChange={(e) => setRegGear(e.target.value)}
                      placeholder="Contoh: Sony A7 IV · 70-200mm f/2.8 GM"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
                  >
                    {loading ? 'Mendaftarkan Akun...' : 'Daftar sebagai Fotografer'}
                  </button>
                </form>
              )}

              {/* Security Policy Reminder */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Kebijakan ombo.id:</strong> Hanya fotografer terverifikasi yang dapat mengunggah foto. Semua foto otomatis mendapat watermark pelindung dan diatribusikan dengan hak cipta nama fotografer.
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
