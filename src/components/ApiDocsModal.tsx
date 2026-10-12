import React, { useState } from 'react';
import { X, BookOpen, Copy, Terminal, Check, Play, Shield, Code2, ExternalLink } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminKey: string;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose, adminKey }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'quickstart' | 'architecture'>('quickstart');
  const [runnerResponse, setRunnerResponse] = useState<string | null>(null);
  const [runningIdx, setRunningIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const endpoints = [
    { method: 'POST', path: '/admin/events', access: 'admin', desc: 'Buat event lari baru', sampleBody: '{"name":"Jambi Run 10K","event_date":"2026-10-12","price":15000}' },
    { method: 'GET', path: '/events', access: 'publik', desc: 'Daftar semua event' },
    { method: 'POST', path: '/admin/events/{id}/photos', access: 'admin', desc: 'Upload foto, diproses di latar belakang' },
    { method: 'GET', path: '/admin/events/{id}/status', access: 'admin', desc: 'Jumlah foto per status (pending -> done)' },
    { method: 'DELETE', path: '/admin/photos/{id}', access: 'admin', desc: 'Hapus foto dari DB dan storage' },
    { method: 'GET', path: '/events/{id}/photos?bib=', access: 'publik', desc: 'Galeri / cari berdasarkan nomor bib' },
    { method: 'POST', path: '/events/{id}/search/face', access: 'publik', desc: 'Cari foto dengan upload selfie' },
    { method: 'POST', path: '/orders', access: 'publik', desc: 'Buat pesanan, dapat teks pesan WhatsApp', sampleBody: '{"event_id":1,"photo_ids":[1,2],"runner_name":"Rian","runner_phone":"081234567890"}' },
    { method: 'GET', path: '/admin/orders', access: 'admin', desc: 'Daftar semua pesanan' },
    { method: 'POST', path: '/admin/orders/{id}/paid', access: 'admin', desc: 'Tandai lunas, buat link unduh berbatas waktu' },
    { method: 'GET', path: '/download/{token}', access: 'token', desc: 'URL unduh foto asli beresolusi penuh' },
  ];

  const quickstartSteps = [
    {
      title: '1. Buat Event',
      cmd: `curl -X POST http://localhost:3000/admin/events \\
  -H "X-Admin-Key: ${adminKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Jambi Run 10K","event_date":"2026-10-12","price":15000}'`,
      runEndpoint: '/admin/events',
      runMethod: 'POST',
      runBody: { name: "Jambi Run 10K", event_date: "2026-10-12", price: 15000 },
      needsAdmin: true,
    },
    {
      title: '2. Upload Foto (Boleh Banyak Sekaligus)',
      cmd: `curl -X POST http://localhost:3000/admin/events/1/photos \\
  -H "X-Admin-Key: ${adminKey}" \\
  -F files=@foto1.jpg -F files=@foto2.jpg`,
      runEndpoint: '/admin/events/1/photos',
      runMethod: 'POST',
      runBody: {},
      needsAdmin: true,
    },
    {
      title: '3. Pantau Pemrosesan Latar Belakang (pending -> done)',
      cmd: `curl http://localhost:3000/admin/events/1/status \\
  -H "X-Admin-Key: ${adminKey}"`,
      runEndpoint: '/admin/events/1/status',
      runMethod: 'GET',
      needsAdmin: true,
    },
    {
      title: '4. Cari Lewat BIB atau Selfie (Publik)',
      cmd: `curl "http://localhost:3000/events/1/photos?bib=101"`,
      runEndpoint: '/events/1/photos?bib=101',
      runMethod: 'GET',
      needsAdmin: false,
    },
    {
      title: '5. Buat Pesanan (Dapat Teks WA)',
      cmd: `curl -X POST http://localhost:3000/orders \\
  -H "Content-Type: application/json" \\
  -d '{"event_id":1,"photo_ids":[1,2],"runner_name":"Rian Pratama","runner_phone":"081234567890"}'`,
      runEndpoint: '/orders',
      runMethod: 'POST',
      runBody: { event_id: 1, photo_ids: [1, 2], runner_name: "Rian Pratama", runner_phone: "081234567890" },
      needsAdmin: false,
    },
    {
      title: '6. Tandai Lunas Setelah Bukti Bayar Masuk di WA',
      cmd: `curl -X POST http://localhost:3000/admin/orders/1/paid \\
  -H "X-Admin-Key: ${adminKey}"`,
      runEndpoint: '/admin/orders/1/paid',
      runMethod: 'POST',
      needsAdmin: true,
    },
    {
      title: '7. Unduh Foto Asli via Token',
      cmd: `curl http://localhost:3000/download/dl_tok_rian101_sample?format=json`,
      runEndpoint: '/download/dl_tok_rian101_sample?format=json',
      runMethod: 'GET',
      needsAdmin: false,
    },
  ];

  const handleCopyCmd = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleRunLive = async (step: typeof quickstartSteps[0], idx: number) => {
    try {
      setRunningIdx(idx);
      setRunnerResponse('Mengirim request...');

      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      if (step.needsAdmin) {
        headers['X-Admin-Key'] = adminKey;
      }
      if (step.runBody && step.runMethod !== 'GET') {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(step.runEndpoint, {
        method: step.runMethod,
        headers,
        body: step.runMethod !== 'GET' ? JSON.stringify(step.runBody) : undefined,
      });

      const data = await res.json().catch(() => ({ status: res.status, text: res.statusText }));
      setRunnerResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setRunnerResponse(`Error: ${err.message}`);
    } finally {
      setRunningIdx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dokumentasi API ombo.id (/docs)</h2>
              <span className="text-xs text-neutral-400 font-mono">
                RESTful API Specification & Interactive cURL Explorer
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

        {/* Tab switch */}
        <div className="px-5 bg-neutral-950 border-b border-neutral-800 flex gap-2">
          {[
            { id: 'quickstart', label: 'Coba Alurnya (cURL)' },
            { id: 'endpoints', label: 'Daftar 11 Endpoint' },
            { id: 'architecture', label: 'Arsitektur & Privasi UU PDP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-white font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: QUICKSTART CURL */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Jalankan perintah cURL di bawah ini langsung di terminal Anda atau klik tombol <strong className="text-orange-400">"Tes Langsung"</strong> untuk mengeksekusi request secara interaktif:
              </p>

              <div className="space-y-4">
                {quickstartSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono">{step.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRunLive(step, idx)}
                          disabled={runningIdx === idx}
                          className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          {runningIdx === idx ? 'Menjalankan...' : 'Tes Langsung'}
                        </button>
                        <button
                          onClick={() => handleCopyCmd(step.cmd, idx)}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                        >
                          {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedIdx === idx ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    </div>

                    <pre className="bg-neutral-900/90 text-neutral-300 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-neutral-800">
                      {step.cmd}
                    </pre>
                  </div>
                ))}
              </div>

              {runnerResponse && (
                <div className="bg-neutral-950 border border-orange-500/40 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-orange-400">
                    <span className="font-bold">Output Respons API:</span>
                    <button onClick={() => setRunnerResponse(null)} className="text-neutral-500 hover:text-white">Clear</button>
                  </div>
                  <pre className="bg-neutral-900 p-3 rounded-lg text-xs font-mono text-emerald-400 max-h-48 overflow-y-auto whitespace-pre-wrap border border-neutral-800">
                    {runnerResponse}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENDPOINTS LIST */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Path</th>
                      <th className="py-2.5 px-3">Akses</th>
                      <th className="py-2.5 px-3">Fungsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {endpoints.map((ep, i) => (
                      <tr key={i} className="hover:bg-neutral-950/50">
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ep.method === 'POST'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : ep.method === 'DELETE'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">{ep.path}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[11px] ${ep.access === 'admin' ? 'text-orange-400' : 'text-neutral-400'}`}>
                            {ep.access}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-300 font-sans">{ep.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & PRIVACY */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed font-sans">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-sm">1. Deteksi Nomor Bib (OCR Dada)</h4>
                <p className="text-neutral-400">
                  Untuk tiap wajah yang terdeteksi, area dada di bawahnya di-crop lalu dibaca OCR. Cara ini lebih akurat dibanding membaca seluruh foto dan bib langsung terhubung ke orangnya. Jika tidak terbaca, dilakukan OCR seluruh foto sebagai cadangan.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Pencarian Wajah (Vector Similarity)</h4>
                <p className="text-neutral-400">
                  Selfie diubah menjadi embedding 512-dimensi di memori sementara (tidak disimpan ke storage/database), lalu dibandingkan dengan vektor wajah pada event tersebut menggunakan Cosine Similarity. Hasil di atas ambang <code>FACE_THRESHOLD</code> (0.40) dikembalikan ke pengguna.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  3. Privasi & Kepatuhan UU PDP
                </h4>
                <p className="text-neutral-400">
                  Wajah adalah data biometrik sensitif. Sistem ini dirancang "Privacy by Design": selfie tidak pernah disimpan di disk, preview foto diproteksi watermark anti-curi, foto asli beresolusi tinggi hanya dapat diakses melalui token unduhan unik berbatas waktu (7 hari), dan admin memiliki endpoint pembersihan data <code>DELETE /admin/photos/{'{id}'}</code>.
                </p>
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
