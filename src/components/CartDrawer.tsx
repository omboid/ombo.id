import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, MessageSquare } from 'lucide-react';
import { PhotoItem, EventItem, OrderItem } from '../types';
import { createOrder } from '../lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: PhotoItem[];
  onRemovePhoto: (id: number) => void;
  onClearCart: () => void;
  event: EventItem;
  onOrderCreated: (order: OrderItem) => void;
  defaultBib?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  selectedPhotos,
  onRemovePhoto,
  onClearCart,
  event,
  onOrderCreated,
  defaultBib = '',
}) => {
  const [runnerName, setRunnerName] = useState('');
  const [runnerPhone, setRunnerPhone] = useState('');
  const [runnerBib, setRunnerBib] = useState(defaultBib);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalAmount = selectedPhotos.length * event.price;
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      setErrorMsg('Pilih minimal 1 foto untuk dipesan.');
      return;
    }
    if (!runnerName.trim()) {
      setErrorMsg('Mohon isi nama lengkap pelari.');
      return;
    }
    if (!runnerPhone.trim()) {
      setErrorMsg('Mohon isi nomor WhatsApp aktif untuk konfirmasi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const order = await createOrder({
        event_id: event.id,
        photo_ids: selectedPhotos.map((p) => p.id),
        runner_name: runnerName.trim(),
        runner_phone: runnerPhone.trim(),
        runner_bib: runnerBib.trim() || undefined,
      });

      onOrderCreated(order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Keranjang Foto</h2>
              <span className="text-xs font-mono text-neutral-400">({selectedPhotos.length})</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photos List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selectedPhotos.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-sm text-neutral-400">Belum ada foto yang dipilih.</p>
                <p className="text-xs text-neutral-500">
                  Cari nomor bib atau gunakan selfie, lalu klik tombol "+ Tambah" pada foto yang diinginkan.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                  <span>Foto Terpilih ({selectedPhotos.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Kosongkan
                  </button>
                </div>

                <div className="space-y-2.5">
                  {selectedPhotos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 bg-neutral-950 rounded-xl border border-neutral-800/80 group"
                    >
                      <img
                        src={p.thumbnail_url || p.preview_url}
                        alt={`Photo ${p.id}`}
                        className="w-16 h-12 rounded-lg object-cover bg-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-mono font-bold text-white truncate">
                          {p.bib_number ? `BIB #${p.bib_number}` : 'Foto Peserta'}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {p.camera_info || 'Kamera Pro'}
                        </div>
                        <div className="text-[11px] font-mono text-orange-400 font-semibold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(event.price)}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemovePhoto(p.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Runner Form */}
                <form id="orderForm" onSubmit={handleSubmitOrder} className="pt-4 border-t border-neutral-800 space-y-3">
                  <span className="text-xs font-mono uppercase text-neutral-400 font-semibold tracking-wider">
                    Data Pemesan (Tanpa Login)
                  </span>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nama Lengkap Pelari *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={runnerName}
                      onChange={(e) => setRunnerName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={runnerPhone}
                      onChange={(e) => setRunnerPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Nomor Bib (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 101"
                      value={runnerBib}
                      onChange={(e) => setRunnerBib(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                      {errorMsg}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {selectedPhotos.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-950 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-neutral-400 font-mono">Total Pembayaran:</span>
                <span className="text-xl font-extrabold text-white font-mono">{formattedTotal}</span>
              </div>

              <button
                type="submit"
                form="orderForm"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                {isSubmitting ? 'Membuat Pesanan...' : 'Pesan Sekarang via WhatsApp'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pesan instan tanpa perlu mendaftar akun</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
