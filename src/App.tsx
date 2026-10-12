import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SearchControls } from './components/SearchControls';
import { PhotoCard } from './components/PhotoCard';
import { PhotoModal } from './components/PhotoModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { DownloadPortal } from './components/DownloadPortal';
import { AdminPanel } from './components/AdminPanel';
import { ApiDocsModal } from './components/ApiDocsModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { PhotographerModal } from './components/PhotographerModal';
import { EventItem, PhotoItem, OrderItem, PhotographerProfile } from './types';
import { getEvents, getPhotos, searchByFace, DEFAULT_ADMIN_KEY } from './lib/api';
import {
  Sparkles,
  ShoppingBag,
  CheckCircle,
  Search,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Camera,
  Download,
} from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeTab, setActiveTab] = useState<'bib' | 'face'>('bib');
  
  // Search state
  const [bibQuery, setBibQuery] = useState('');
  const [isSearchingFace, setIsSearchingFace] = useState(false);
  const [faceSearchFeedback, setFaceSearchFeedback] = useState<{
    matchesCount: number;
    detectedBibs: string[];
  } | null>(null);

  // Cart & Orders
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<OrderItem | null>(null);

  // Modals & Views
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const [downloadPortalOpen, setDownloadPortalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [photographerModalOpen, setPhotographerModalOpen] = useState(false);
  const [activeDownloadToken, setActiveDownloadToken] = useState('');

  // Registered Photographer State
  const [currentPhotographer, setCurrentPhotographer] = useState<PhotographerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fotolari_photographer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<number | null>(null);

  // Loading & error
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check URL query parameters on initial mount (e.g. ?download_token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get('download_token');
    if (tok) {
      setActiveDownloadToken(tok);
      setDownloadPortalOpen(true);
    }
  }, []);

  // Fetch initial events
  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err: any) {
      setErrorMsg('Gagal memuat event lari');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Load photos when selected event or bib query changes
  const loadEventPhotos = async (eventId: number, bib = '', photographerId?: number | null) => {
    try {
      setLoadingPhotos(true);
      setErrorMsg('');
      let url = `/events/${eventId}/photos${bib ? `?bib=${encodeURIComponent(bib)}` : ''}`;
      if (photographerId) {
        url += `${bib ? '&' : '?'}photographer_id=${photographerId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat foto');
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (selectedEvent && activeTab === 'bib') {
      loadEventPhotos(selectedEvent.id, bibQuery, selectedPhotographerId);
    }
  }, [selectedEvent, bibQuery, activeTab, selectedPhotographerId]);

  // Handle Selfie Face Search
  const handleSelfieSearch = async (file: File | null, base64?: string, matchBibHint?: string) => {
    if (!selectedEvent) return;

    if (!file && !base64) {
      // Cleared selfie, reload normal photos
      setFaceSearchFeedback(null);
      loadEventPhotos(selectedEvent.id);
      return;
    }

    try {
      setIsSearchingFace(true);
      setErrorMsg('');

      const res = await searchByFace(selectedEvent.id, {
        file: file || undefined,
        base64: base64,
        matchBib: matchBibHint,
      });

      setPhotos(res.matches);
      setFaceSearchFeedback({
        matchesCount: res.matches_count,
        detectedBibs: res.detected_bibs,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Pencarian wajah gagal');
    } finally {
      setIsSearchingFace(false);
    }
  };

  // Cart operations
  const handleToggleSelect = (photo: PhotoItem) => {
    setSelectedPhotos((prev) => {
      const exists = prev.some((p) => p.id === photo.id);
      if (exists) {
        return prev.filter((p) => p.id !== photo.id);
      } else {
        return [...prev, photo];
      }
    });
  };

  const handleRemoveFromCart = (photoId: number) => {
    setSelectedPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSelectAllVisible = () => {
    const newItems = [...selectedPhotos];
    photos.forEach((p) => {
      if (!newItems.some((item) => item.id === p.id)) {
        newItems.push(p);
      }
    });
    setSelectedPhotos(newItems);
  };

  // Unique active bib numbers for quick suggestion tags
  const activeBibs = Array.from(
    new Set(photos.map((p) => p.bib_number).filter(Boolean) as string[])
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-orange-600 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={(ev) => {
          setSelectedEvent(ev);
          setBibQuery('');
          setFaceSearchFeedback(null);
          setSelectedPhotos([]);
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setFaceSearchFeedback(null);
          if (selectedEvent) {
            loadEventPhotos(selectedEvent.id);
          }
        }}
        cartCount={selectedPhotos.length}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenDownloadPortal={() => setDownloadPortalOpen(true)}
        onOpenAdmin={() => setAdminPanelOpen(true)}
        onOpenDocs={() => setApiDocsOpen(true)}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
        photographer={currentPhotographer}
        onOpenPhotographerModal={() => setPhotographerModalOpen(true)}
      />

      {/* Main View: Gallery or Download Portal */}
      {downloadPortalOpen ? (
        <DownloadPortal
          initialToken={activeDownloadToken}
          onBackToGallery={() => {
            setDownloadPortalOpen(false);
            window.history.replaceState({}, '', '/');
          }}
        />
      ) : (
        <main className="flex-1 pb-24">
          
          {/* Hero Section */}
          {selectedEvent && (
            <HeroSection
              event={selectedEvent}
              photoCount={photos.length}
            />
          )}

          {/* Quick Demo Workflow Strip */}
          <div className="border-b border-neutral-800/60 bg-neutral-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="hidden sm:inline">Uji Cepat Fitur:</span>
                <button
                  onClick={() => {
                    setActiveTab('bib');
                    setBibQuery('101');
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                >
                  Bib #101
                </button>
                <button
                  onClick={() => {
                    setActiveTab('bib');
                    setBibQuery('204');
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
                >
                  Bib #204
                </button>
                <button
                  onClick={() => {
                    setActiveTab('face');
                    handleSelfieSearch(null, undefined, '101');
                  }}
                  className="px-2 py-0.5 rounded bg-orange-600/20 text-orange-300 hover:bg-orange-600/30 text-xs font-mono transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  Tes Selfie Wajah
                </button>
                <button
                  onClick={() => setPhotographerModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-mono transition-colors flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  {currentPhotographer ? `Fotografer: ${currentPhotographer.name.split(' ')[0]}` : 'Login Fotografer'}
                </button>
              </div>

              <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-mono">
                <button
                  onClick={() => {
                    setActiveDownloadToken('dl_tok_rian101_sample');
                    setDownloadPortalOpen(true);
                  }}
                  className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Klaim Token Contoh</span>
                </button>
                <span className="text-neutral-700">·</span>
                <button
                  onClick={() => setHowItWorksOpen(true)}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3 h-3 text-orange-400" />
                  <span>Panduan Pemesanan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Controls (Bib OCR + Selfie Camera) */}
          <SearchControls
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              setFaceSearchFeedback(null);
              if (selectedEvent) loadEventPhotos(selectedEvent.id, '', selectedPhotographerId);
            }}
            bibQuery={bibQuery}
            onBibChange={setBibQuery}
            onSelfieUpload={handleSelfieSearch}
            isSearchingFace={isSearchingFace}
            activeBibs={activeBibs}
            totalPhotosCount={photos.length}
          />

          {/* Gallery Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            
            {/* Gallery Subheader / Status Feedback */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80 mb-6">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {activeTab === 'bib' ? 'Galeri Foto Maraton' : 'Hasil Pencarian Wajah'}
                  </h2>
                  <span className="text-xs font-mono text-neutral-400">
                    ({photos.length} foto)
                  </span>
                </div>

                {/* Face Search Match Result Text */}
                {faceSearchFeedback && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ditemukan {faceSearchFeedback.matchesCount} foto dengan kecocokan di atas ambang batas (FACE_THRESHOLD).
                    {faceSearchFeedback.detectedBibs.length > 0 && (
                      <span className="text-neutral-300">
                        Bib terkait: #{faceSearchFeedback.detectedBibs.join(', #')}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons & Photographer Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Photographer Filter */}
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs font-mono">
                  <button
                    onClick={() => setSelectedPhotographerId(null)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPhotographerId === null ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Semua Fotografer
                  </button>
                  <button
                    onClick={() => setSelectedPhotographerId(1)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPhotographerId === 1 ? 'bg-orange-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Ombo Jambi
                  </button>
                  <button
                    onClick={() => setSelectedPhotographerId(2)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPhotographerId === 2 ? 'bg-orange-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Budi Lens
                  </button>
                  <button
                    onClick={() => setSelectedPhotographerId(3)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPhotographerId === 3 ? 'bg-orange-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Siti Lens
                  </button>
                </div>

                {photos.length > 0 && (
                  <button
                    onClick={handleSelectAllVisible}
                    className="text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    + Pilih Semua ({photos.length})
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Photos Grid */}
            {loadingPhotos || isSearchingFace ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                <p className="text-sm font-mono text-neutral-400">
                  {isSearchingFace ? 'Menganalisis kemiripan fitur wajah dengan AI vector...' : 'Memuat foto maraton...'}
                </p>
              </div>
            ) : photos.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/80 p-8 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Tidak ada foto yang cocok</h3>
                  <p className="text-xs text-neutral-400">
                    {bibQuery
                      ? `Nomor bib #${bibQuery} belum ditemukan. Coba periksa kembali atau gunakan pencarian selfie wajah.`
                      : 'Belum ada foto yang tersedia untuk kriteria ini.'}
                  </p>
                </div>
                {bibQuery && (
                  <button
                    onClick={() => setBibQuery('')}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono rounded-xl transition-colors"
                  >
                    Tampilkan Semua Foto
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    isSelected={selectedPhotos.some((p) => p.id === photo.id)}
                    onToggleSelect={handleToggleSelect}
                    onOpenPreview={setPreviewPhoto}
                    price={selectedEvent?.price || 15000}
                    eventName={selectedEvent?.name || 'ombo.id'}
                  />
                ))}
              </div>
            )}

          </div>

          {/* FAQ & Information Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Pertanyaan yang Sering Diajukan (FAQ)</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Seputar format file, pembayaran WhatsApp, dan privasi biometrik wajah.
                  </p>
                </div>

                <button
                  onClick={() => setHowItWorksOpen(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  Buka Panduan Lengkap <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="font-bold text-white">Apakah foto yang didapat ada watermark?</h4>
                  <p className="text-neutral-400 leading-relaxed">
                    Tidak sama sekali! Watermark hanya pelindung pratinjau di website. Setelah konfirmasi via WhatsApp, Anda akan menerima link token resmi untuk mengunduh foto asli resolusi penuh (HD 2400×1600+ piksel).
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="font-bold text-white">Bagaimana keamanan data foto selfie saya?</h4>
                  <p className="text-neutral-400 leading-relaxed">
                    Sesuai ketentuan UU PDP, selfie Anda hanya diproses di memori (RAM) untuk menghasilkan nilai embedding numerik dan langsung dibuang setelah proses pencocokan selesai. Kami tidak menyimpan foto selfie Anda.
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="font-bold text-white">Berapa lama masa aktif link unduhan?</h4>
                  <p className="text-neutral-400 leading-relaxed">
                    Token tautan unduh berlaku aktif selama 7 hari kalender. Anda dapat mengunduh foto kapan saja dan menyimpannya di perangkat Anda secara aman.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Sticky Cart Bar (Mobile & Desktop) */}
          {selectedPhotos.length > 0 && (
            <div className="fixed bottom-5 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
              <div className="pointer-events-auto bg-neutral-900/95 backdrop-blur-md border border-neutral-800 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-5 max-w-lg w-full justify-between">
                <div>
                  <div className="text-xs text-neutral-400 font-mono">
                    <strong className="text-white font-bold">{selectedPhotos.length} foto</strong> dipilih
                  </div>
                  <div className="text-sm font-extrabold text-orange-400 font-mono">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                      selectedPhotos.length * (selectedEvent?.price || 15000)
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCartDrawerOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buka Keranjang & Pesan
                </button>
              </div>
            </div>
          )}

        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="ombo.id logo" className="w-5 h-5 rounded-full" />
            <span>
              © 2026 <strong>ombo.id</strong> · Ombo Photography · OCR Bib Dada + Pencarian Wajah AI · Checkout WhatsApp
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setHowItWorksOpen(true)} className="hover:text-neutral-300">
              Cara Pesan
            </button>
            <span>·</span>
            <button onClick={() => setApiDocsOpen(true)} className="hover:text-neutral-300">
              Dokumentasi API (/docs)
            </button>
            <span>·</span>
            <button onClick={() => setDownloadPortalOpen(true)} className="hover:text-neutral-300">
              Klaim Unduhan
            </button>
            <span>·</span>
            <button onClick={() => setAdminPanelOpen(true)} className="hover:text-neutral-300">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        onTryBib={() => {
          setActiveTab('bib');
          setBibQuery('101');
        }}
        onTrySelfie={() => {
          setActiveTab('face');
          handleSelfieSearch(null, undefined, '101');
        }}
      />

      {/* Lightbox Photo Preview Modal */}
      {previewPhoto && selectedEvent && (
        <PhotoModal
          photo={previewPhoto}
          event={selectedEvent}
          isSelected={selectedPhotos.some((p) => p.id === previewPhoto.id)}
          onToggleSelect={handleToggleSelect}
          onClose={() => setPreviewPhoto(null)}
        />
      )}

      {/* Slide-out Cart Drawer */}
      {selectedEvent && (
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          selectedPhotos={selectedPhotos}
          onRemovePhoto={handleRemoveFromCart}
          onClearCart={() => setSelectedPhotos([])}
          event={selectedEvent}
          defaultBib={bibQuery}
          onOrderCreated={(order) => {
            setNewOrder(order);
            setSelectedPhotos([]);
          }}
        />
      )}

      {/* Order Created Success Modal (WhatsApp checkout) */}
      {newOrder && (
        <OrderSuccessModal
          order={newOrder}
          onClose={() => setNewOrder(null)}
          bankDetails={selectedEvent?.bank_info}
        />
      )}

      {/* Admin Panel Modal */}
      {selectedEvent && (
        <AdminPanel
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          currentEvent={selectedEvent}
          events={events}
          onRefreshEvents={loadEvents}
          onRefreshPhotos={() => loadEventPhotos(selectedEvent.id, bibQuery)}
        />
      )}

      {/* Interactive API Docs Modal */}
      <ApiDocsModal
        isOpen={apiDocsOpen}
        onClose={() => setApiDocsOpen(false)}
        adminKey={localStorage.getItem('fotolari_admin_key') || DEFAULT_ADMIN_KEY}
      />

      {/* Photographer Login & Upload Portal Modal */}
      {selectedEvent && (
        <PhotographerModal
          isOpen={photographerModalOpen}
          onClose={() => setPhotographerModalOpen(false)}
          currentPhotographer={currentPhotographer}
          onLoginSuccess={(photog, token) => {
            const profileWithToken = { ...photog, token };
            setCurrentPhotographer(profileWithToken);
            localStorage.setItem('fotolari_photographer_profile', JSON.stringify(profileWithToken));
            localStorage.setItem('fotolari_photographer_token', token);
            loadEventPhotos(selectedEvent.id, bibQuery, selectedPhotographerId);
          }}
          onLogout={() => {
            setCurrentPhotographer(null);
            localStorage.removeItem('fotolari_photographer_profile');
            localStorage.removeItem('fotolari_photographer_token');
          }}
          currentEvent={selectedEvent}
          onPhotosUploaded={() => {
            loadEventPhotos(selectedEvent.id, bibQuery, selectedPhotographerId);
          }}
        />
      )}

    </div>
  );
}
