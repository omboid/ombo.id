import React, { useState } from 'react';
import { X, CheckCircle, Copy, ExternalLink, MessageSquare, CreditCard, ShieldAlert } from 'lucide-react';
import { OrderItem } from '../types';

interface OrderSuccessModalProps {
  order: OrderItem | null;
  onClose: () => void;
  bankDetails?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  bankDetails,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(order.total_amount);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.wa_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pesanan Berhasil Dibuat!</h2>
              <span className="text-xs font-mono text-neutral-400">{order.order_number}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Order Summary Box */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-mono">No. Pesanan:</span>
              <span className="font-mono font-bold text-white">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-mono">Nama Pelari:</span>
              <span className="font-semibold text-neutral-200">{order.runner_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-mono">Jumlah Foto:</span>
              <span className="font-mono text-neutral-200">{order.photo_ids.length} foto HD</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-sm">
              <span className="text-neutral-300 font-medium">Total Tagihan:</span>
              <span className="text-base font-extrabold text-orange-400 font-mono">{formattedTotal}</span>
            </div>
          </div>

          {/* WhatsApp Direct CTA */}
          <div className="space-y-2">
            <a
              href={order.wa_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
            >
              <MessageSquare className="w-5 h-5" />
              Kirim Pesanan ke WhatsApp Official
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            <p className="text-[11px] text-center text-neutral-400">
              WhatsApp akan terbuka otomatis dengan format teks pesanan siap kirim.
            </p>
          </div>

          {/* Payment & Bank Details */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200 font-mono">
              <CreditCard className="w-4 h-4 text-orange-400" />
              REKENING PEMBAYARAN RESMI
            </div>
            <pre className="text-xs font-mono text-neutral-300 bg-neutral-900/80 p-3 rounded-lg whitespace-pre-line border border-neutral-800">
              {bankDetails || 'BCA: 1234-5678-90 a.n. ombo.id Official\nMandiri: 9876-5432-10\nQRIS tersedia via chat WhatsApp'}
            </pre>
          </div>

          {/* Formatted Text Box & Copy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400">Format Pesan WhatsApp:</span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Tersalin!' : 'Salin Pesan'}
              </button>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-400 max-h-28 overflow-y-auto whitespace-pre-wrap">
              {order.wa_text}
            </div>
          </div>

          {/* Flow Reassurance */}
          <div className="flex items-start gap-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Langkah selanjutnya:</strong> Kirimkan bukti transfer Anda ke WhatsApp tersebut. Tim ombo.id akan memverifikasi dan mengirimkan tautan unduhan foto asli resolusi penuh (tanpa watermark).
            </span>
          </div>

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
