import React from 'react';
import { X, Search, Camera, ShoppingBag, MessageSquare, ShieldCheck, Download, ArrowRight } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryBib: () => void;
  onTrySelfie: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onTryBib,
  onTrySelfie,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Cari Foto Larimu Secara Instan',
      desc: 'Masukkan nomor bib dada pelari untuk pencarian OCR otomatis, atau unggah foto selfie untuk pencocokan wajah berbasis AI vector similarity.',
      icon: Search,
      actionText: 'Cari Nomor BIB',
      action: onTryBib,
    },
    {
      step: '02',
      title: 'Pilih Foto & Pratinjau Terproteksi',
      desc: 'Lihat pratinjau foto ber-watermark untuk memeriksa ekspresi, ketajaman, dan sudut bidikan. Pilih foto favorit atau semua foto sekaligus.',
      icon: ShoppingBag,
    },
    {
      step: '03',
      title: 'Pesan Tanpa Login via WhatsApp',
      desc: 'Sistem otomatis menyiapkan rincian pesanan dengan kode unik (ORD-xxx). Cukup klik 1 tombol untuk membuka chat WhatsApp resmi fotografer.',
      icon: MessageSquare,
    },
    {
      step: '04',
      title: 'Transfer & Terima Link Unduh HD',
      desc: 'Kirim bukti transfer di WhatsApp. Admin memverifikasi pesanan dan langsung mengirimkan tautan token untuk mengunduh foto asli HD tanpa watermark!',
      icon: Download,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Cara Kerja ombo.id
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              Pencarian foto maraton cepat, aman, tanpa perlu repot mendaftar akun
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between gap-3 group hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-orange-400">
                        LANGKAH {s.step}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 text-neutral-300 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{s.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                  </div>

                  {s.actionText && (
                    <button
                      onClick={() => {
                        onClose();
                        s.action && s.action();
                      }}
                      className="mt-1 text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                    >
                      {s.actionText} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Jaminan Privasi & Hak Cipta:</strong> Foto pratinjau dilindungi watermark anti-pencurian. Foto selfie pelari hanya dianalisis di memori sementara (RAM) dan tidak pernah disimpan di server sesuai ketentuan UU Perlindungan Data Pribadi (UU PDP).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Mengerti & Mulai Cari Foto
          </button>
        </div>

      </div>
    </div>
  );
};
