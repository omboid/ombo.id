import React from 'react';
import { X, Check, Plus, Camera, Clock, Shield, Sparkles, Tag } from 'lucide-react';
import { PhotoItem, EventItem } from '../types';
import { WatermarkedImage } from './WatermarkedImage';

interface PhotoModalProps {
  photo: PhotoItem | null;
  event: EventItem;
  isSelected: boolean;
  onToggleSelect: (photo: PhotoItem) => void;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  event,
  isSelected,
  onToggleSelect,
  onClose,
}) => {
  if (!photo) return null;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(event.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-white">
              {photo.bib_number ? `BIB #${photo.bib_number}` : 'Nomor Bib Belum Teridentifikasi'}
            </span>
            <span className="text-neutral-500 font-mono text-xs hidden sm:inline">
              · {photo.filename}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Large Preview + Details */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Main Large Image with Watermark */}
          <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[320px] max-h-[60vh] md:max-h-none">
            <WatermarkedImage
              src={photo.thumbnail_url || photo.preview_url}
              alt={`Foto ${photo.bib_number}`}
              eventTitle={event.name}
              bibNumber={photo.bib_number}
              className="w-full h-full max-h-[70vh] object-contain"
            />
          </div>

          {/* Sidebar Specs & Purchase Action */}
          <div className="md:w-2/5 p-5 flex flex-col justify-between gap-5 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800">
            
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-orange-400 font-semibold tracking-wider">
                  {event.name}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Foto Resmi Peserta
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Foto original kamera DSLR/Mirrorless tanpa kompresi akan diberikan via link unduhan setelah pembayaran diverifikasi.
                </p>
              </div>

              {/* Technical Inspection Info */}
              <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500">Nomor Bib Utama:</span>
                  <span className="font-bold text-orange-400">#{photo.bib_number || 'N/A'}</span>
                </div>

                {photo.ocr_confidence && (
                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-neutral-500">Keyakinan OCR Bib:</span>
                    <span>{Math.round(photo.ocr_confidence * 100)}%</span>
                  </div>
                )}

                {photo.match_confidence !== undefined && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Kecocokan Wajah:
                    </span>
                    <span className="font-bold">{Math.round(photo.match_confidence * 100)}% Cocok</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500">Wajah Terdeteksi:</span>
                  <span>{photo.faces?.length || 1} orang</span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500">Fotografer:</span>
                  <span className="font-semibold text-orange-400 truncate max-w-[170px]">
                    📸 {photo.photographer_name || 'ombo.id Official'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500">Kamera & Lensa:</span>
                  <span className="truncate max-w-[150px]">{photo.camera_info || 'Sony A7 IV'}</span>
                </div>

                <div className="flex justify-between items-center text-neutral-300">
                  <span className="text-neutral-500">Waktu Pengambilan:</span>
                  <span>{photo.captured_at || '12 Okt 2026'}</span>
                </div>
              </div>

              {/* Security & Watermark Explanation */}
              <div className="flex items-start gap-2 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                <Shield className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  Watermark pada foto di atas hanya pelindung pratinjau. File asli yang diunduh beresolusi penuh (Original High-Res) bersih tanpa watermark.
                </span>
              </div>
            </div>

            {/* Price & Cart Button */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-400 font-mono">Harga Satuan:</span>
                <span className="text-2xl font-extrabold text-white font-mono">{formattedPrice}</span>
              </div>

              <button
                onClick={() => onToggleSelect(photo)}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isSelected
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/40'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4" />
                    Hapus dari Pilihan Pesanan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Tambahkan ke Pesanan ({formattedPrice})
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
