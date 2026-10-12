import React, { useState } from 'react';
import { Camera, Search, ShoppingBag, Lock, Download, BookOpen, ChevronDown, HelpCircle } from 'lucide-react';
import { EventItem, PhotographerProfile } from '../types';
import { OmboLogo } from './OmboLogo';

interface NavbarProps {
  events: EventItem[];
  selectedEvent: EventItem | null;
  onSelectEvent: (event: EventItem) => void;
  activeTab: 'bib' | 'face';
  onChangeTab: (tab: 'bib' | 'face') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenDownloadPortal: () => void;
  onOpenAdmin: () => void;
  onOpenDocs: () => void;
  onOpenHowItWorks: () => void;
  photographer: PhotographerProfile | null;
  onOpenPhotographerModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  activeTab,
  onChangeTab,
  cartCount,
  onOpenCart,
  onOpenDownloadPortal,
  onOpenAdmin,
  onOpenDocs,
  onOpenHowItWorks,
  photographer,
  onOpenPhotographerModal,
}) => {
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Event Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <OmboLogo size={38} showText={true} />
          </div>

          {/* Event Dropdown */}
          {selectedEvent && (
            <div className="relative">
              <button
                onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-xl transition-colors"
              >
                <span className="max-w-[130px] sm:max-w-[200px] truncate">{selectedEvent.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {eventDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setEventDropdownOpen(false)} />
                  <div className="absolute left-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1 z-20">
                    <div className="px-3 py-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                      Pilih Event Lari
                    </div>
                    {events.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onSelectEvent(ev);
                          setEventDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col gap-0.5 ${
                          selectedEvent.id === ev.id
                            ? 'bg-orange-600/10 text-orange-400 font-semibold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span className="truncate">{ev.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {ev.event_date} · {ev.location || 'Indonesia'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Center: Search Mode Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-neutral-900 rounded-xl border border-neutral-800/80">
          <button
            onClick={() => onChangeTab('bib')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'bib'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-orange-500" />
            Nomor BIB (OCR)
          </button>
          <button
            onClick={() => onChangeTab('face')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'face'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-orange-500" />
            Pencarian Selfie
          </button>
        </div>

        {/* Right Navigation & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cara Kerja / Panduan */}
          <button
            onClick={onOpenHowItWorks}
            title="Cara Kerja ombo.id"
            className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Cara Pesan</span>
          </button>

          {/* Klaim Unduhan Token */}
          <button
            onClick={onOpenDownloadPortal}
            title="Klaim foto dengan token unduhan"
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Klaim Unduhan</span>
          </button>

          {/* API Docs Button */}
          <button
            onClick={onOpenDocs}
            title="Dokumentasi API & cURL (/docs)"
            className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1.5 rounded-xl transition-colors font-mono"
          >
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden xl:inline">API /docs</span>
          </button>

          {/* Photographer Login / Portal Trigger */}
          {photographer ? (
            <button
              onClick={onOpenPhotographerModal}
              title={`Fotografer: ${photographer.name}`}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl transition-colors font-medium"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px] hidden sm:inline">{photographer.name.split(' ')[0]}</span>
              <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-md font-extrabold uppercase font-mono">
                Upload
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenPhotographerModal}
              title="Masuk sebagai Fotografer untuk Upload Foto"
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1.5 rounded-xl transition-colors font-medium"
            >
              <Camera className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Fotografer</span>
            </button>
          )}

          {/* Admin Dashboard Portal */}
          <button
            onClick={onOpenAdmin}
            title="Portal Admin & WhatsApp"
            className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 bg-orange-950/40 hover:bg-orange-950/60 border border-orange-500/30 px-2.5 py-1.5 rounded-xl transition-colors font-medium"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Admin</span>
          </button>

          {/* Shopping Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-orange-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Pesanan</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-white text-orange-700 text-xs font-black rounded-full font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
