import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, ShieldCheck, AlertCircle, ArrowLeft, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { DownloadTokenData, PhotoItem } from '../types';
import { getDownloadTokenDetails } from '../lib/api';

interface DownloadPortalProps {
  initialToken?: string;
  onBackToGallery: () => void;
}

export const DownloadPortal: React.FC<DownloadPortalProps> = ({
  initialToken = '',
  onBackToGallery,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken || 'dl_tok_rian101_sample');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenData, setTokenData] = useState<DownloadTokenData | null>(null);

  const fetchToken = async (tok: string) => {
    if (!tok.trim()) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getDownloadTokenDetails(tok.trim());
      setTokenData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Token unduhan tidak valid atau telah kadaluarsa.');
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      fetchToken(initialToken);
    }
  }, [initialToken]);

  // Download single image
  const handleDownload = (photo: PhotoItem) => {
    const link = document.createElement('a');
    link.href = photo.original_url;
    link.download = photo.filename || `ombo_${photo.id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all photos
  const handleDownloadAll = () => {
    if (!tokenData) return;
    tokenData.photos.forEach((photo, idx) => {
      setTimeout(() => {
        handleDownload(photo);
      }, idx * 500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToGallery}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Galeri Foto
        </button>

        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          Klaim Foto Resmi Tanpa Watermark
        </span>
      </div>

      {/* Token Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Portal Unduh Foto Resolusi Asli</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Masukkan token unik unduhan yang Anda terima melalui WhatsApp setelah pembayaran diverifikasi.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchToken(tokenInput);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            required
            placeholder="Ketik token unduhan (contoh: dl_tok_rian101_sample)..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap"
          >
            {loading ? 'Memeriksa Token...' : 'Klaim & Buka Foto'}
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Unlocked Photo Results */}
      {tokenData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Order Metadata Card */}
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/20 to-neutral-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  STATUS: LUNAS & TERVERIFIKASI
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Foto {tokenData.runner_name} {tokenData.runner_bib ? `(BIB #${tokenData.runner_bib})` : ''}
              </h3>
              <p className="text-xs text-neutral-400">
                {tokenData.event_name} · Pesanan #{tokenData.order_number}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right font-mono text-xs">
                <div className="text-neutral-400 flex items-center sm:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  Masa Berlaku Link:
                </div>
                <div className="text-white font-semibold">
                  {tokenData.expires_at ? new Date(tokenData.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '7 Hari'}
                </div>
              </div>

              <button
                onClick={handleDownloadAll}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Unduh Semua ({tokenData.photos.length} Foto HD)
              </button>
            </div>
          </div>

          {/* Clean Photos Grid (Original, WITHOUT WATERMARK) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenData.photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-neutral-700 transition-all"
              >
                {/* Clean Image Container (No Watermark!) */}
                <div className="relative aspect-[3/2] w-full bg-black overflow-hidden">
                  <img
                    src={photo.original_url}
                    alt={`Foto Original #${photo.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                    CLEAN HD
                  </div>
                </div>

                {/* Photo Info & Download Trigger */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">
                      {photo.filename || `Foto_HD_${idx + 1}.jpg`}
                    </div>
                    <div className="text-xs font-mono text-neutral-400 mt-0.5">
                      {photo.bib_number ? `BIB #${photo.bib_number}` : 'Nomor Peserta'} · 2400 × 1600 px (Original)
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(photo)}
                    className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Unduh Resolusi Asli (.jpg)
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
