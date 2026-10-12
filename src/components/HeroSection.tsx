import React from 'react';
import { Calendar, MapPin, Tag, ShieldCheck, Zap } from 'lucide-react';
import { EventItem } from '../types';

interface HeroSectionProps {
  event: EventItem;
  photoCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ event, photoCount }) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(event.price);

  return (
    <div className="relative border-b border-neutral-800/80 bg-neutral-900/40">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 blur-3xl pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          <div className="space-y-3 max-w-3xl">
            {/* Metadata line (clean unboxed text per design rules) */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1 text-orange-400">
                <Calendar className="w-3.5 h-3.5" />
                {event.event_date}
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                {event.location || 'Jambi, Indonesia'}
              </span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-neutral-400">{photoCount} foto terindeks</span>
            </div>

            {/* Event Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {event.name}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              {event.description || 'Temukan foto larimu dengan nomor bib dada atau selfie wajah secara instan.'}
            </p>

            {/* Value Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Pencarian Cepat AI Vision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tanpa Registrasi / Akun</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-neutral-400" />
                <span>Resolusi Asli Kamera (HD)</span>
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 lg:min-w-[280px] flex flex-col justify-between shadow-xl">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Harga Resmi Foto Asli
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{formattedPrice}</span>
              <span className="text-xs text-neutral-400 font-mono">/ foto HD</span>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 leading-normal flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
              <span>Verifikasi instan via WhatsApp Official</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
