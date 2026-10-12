import { EventItem, PhotoItem, OrderItem, EventStatus, DownloadTokenData, AppSettings } from '../types';

export const DEFAULT_ADMIN_KEY = 'isi-ADMIN_KEY-kamu';

export async function getEvents(): Promise<EventItem[]> {
  const res = await fetch('/events');
  if (!res.ok) throw new Error('Gagal mengambil daftar event');
  return res.json();
}

export async function getEvent(id: number): Promise<EventItem> {
  const res = await fetch(`/events/${id}`);
  if (!res.ok) throw new Error('Event tidak ditemukan');
  return res.json();
}

export async function getPhotos(eventId: number, bib = ''): Promise<{ photos: PhotoItem[]; count: number }> {
  const url = `/events/${eventId}/photos${bib ? `?bib=${encodeURIComponent(bib)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil foto');
  return res.json();
}

export async function searchByFace(
  eventId: number,
  selfieData: { file?: File; base64?: string; matchBib?: string }
): Promise<{ matches: PhotoItem[]; detected_bibs: string[]; total_scanned_faces: number; matches_count: number }> {
  let body: any;
  let headers: HeadersInit = {};

  if (selfieData.file) {
    const formData = new FormData();
    formData.append('selfie', selfieData.file);
    if (selfieData.matchBib) {
      formData.append('match_bib', selfieData.matchBib);
    }
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      selfie_base64: selfieData.base64,
      match_bib: selfieData.matchBib
    });
  }

  const res = await fetch(`/events/${eventId}/search/face`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Gagal mencari wajah' }));
    throw new Error(err.error || 'Pencarian wajah gagal');
  }

  return res.json();
}

export async function createOrder(payload: {
  event_id: number;
  photo_ids: number[];
  runner_name: string;
  runner_phone: string;
  runner_bib?: string;
}): Promise<OrderItem> {
  const res = await fetch('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Gagal membuat pesanan' }));
    throw new Error(err.error || 'Gagal membuat pesanan');
  }

  return res.json();
}

export async function getDownloadTokenDetails(token: string): Promise<DownloadTokenData> {
  const res = await fetch(`/download/${token}?format=json`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Token tidak valid' }));
    throw new Error(err.error || 'Gagal memverifikasi token unduhan');
  }

  return res.json();
}

// Admin APIs
export async function getAdminStatus(eventId: number, adminKey: string): Promise<EventStatus> {
  const res = await fetch(`/admin/events/${eventId}/status`, {
    headers: { 'X-Admin-Key': adminKey }
  });
  if (!res.ok) throw new Error('Gagal mengambil status');
  return res.json();
}

export async function getAdminOrders(adminKey: string): Promise<OrderItem[]> {
  const res = await fetch('/admin/orders', {
    headers: { 'X-Admin-Key': adminKey }
  });
  if (!res.ok) throw new Error('Gagal mengambil daftar pesanan');
  return res.json();
}

export async function markOrderPaid(
  orderId: number,
  adminKey: string
): Promise<{ success: boolean; download_url: string; download_token: string; wa_reply_text: string }> {
  const res = await fetch(`/admin/orders/${orderId}/paid`, {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey }
  });
  if (!res.ok) throw new Error('Gagal menandai lunas');
  return res.json();
}

export async function deletePhoto(photoId: number, adminKey: string): Promise<{ success: boolean }> {
  const res = await fetch(`/admin/photos/${photoId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey }
  });
  if (!res.ok) throw new Error('Gagal menghapus foto');
  return res.json();
}

export async function updatePhotoBib(photoId: number, bibNumber: string, adminKey: string): Promise<any> {
  const res = await fetch(`/admin/photos/${photoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey
    },
    body: JSON.stringify({ bib_number: bibNumber })
  });
  if (!res.ok) throw new Error('Gagal mengubah nomor bib');
  return res.json();
}

export async function createAdminEvent(payload: Partial<EventItem>, adminKey: string): Promise<EventItem> {
  const res = await fetch('/admin/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Gagal membuat event' }));
    throw new Error(err.error || 'Gagal membuat event');
  }
  return res.json();
}

export async function uploadAdminPhotos(
  eventId: number,
  files: File[],
  adminKey?: string,
  photographerToken?: string
): Promise<any> {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));

  const headers: HeadersInit = {};
  if (adminKey) {
    headers['X-Admin-Key'] = adminKey;
  }
  if (photographerToken) {
    headers['Authorization'] = `Bearer ${photographerToken}`;
    headers['X-Photographer-Token'] = photographerToken;
  }

  const res = await fetch(`/admin/events/${eventId}/photos`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Gagal mengupload foto' }));
    throw new Error(err.error || 'Gagal mengupload foto');
  }
  return res.json();
}

export async function getAdminSettings(adminKey: string): Promise<AppSettings> {
  const res = await fetch('/admin/settings', {
    headers: { 'X-Admin-Key': adminKey }
  });
  if (!res.ok) throw new Error('Gagal mengambil pengaturan');
  return res.json();
}

export async function updateAdminSettings(settings: Partial<AppSettings>, adminKey: string): Promise<any> {
  const res = await fetch('/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey
    },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Gagal memperbarui pengaturan');
  return res.json();
}

// ==========================================
// PHOTOGRAPHER CLIENT APIS
// ==========================================
export async function loginPhotographer(email: string, password: string): Promise<{ success: boolean; token: string; photographer: any }> {
  const res = await fetch('/photographers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login fotografer gagal' }));
    throw new Error(err.error || 'Login gagal');
  }
  return res.json();
}

export async function registerPhotographer(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  instagram?: string;
  gear?: string;
}): Promise<{ success: boolean; token: string; photographer: any; message: string }> {
  const res = await fetch('/photographers/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Pendaftaran fotografer gagal' }));
    throw new Error(err.error || 'Pendaftaran gagal');
  }
  return res.json();
}

export async function getPhotographerMe(token: string): Promise<any> {
  const res = await fetch('/photographers/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Photographer-Token': token
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Gagal mengambil data fotografer' }));
    throw new Error(err.error || 'Gagal mengambil profil');
  }
  return res.json();
}

export async function getPhotographers(): Promise<any[]> {
  const res = await fetch('/photographers');
  if (!res.ok) throw new Error('Gagal mengambil daftar fotografer');
  return res.json();
}

export async function getPhotographerPhotos(photographerId: number): Promise<any> {
  const res = await fetch(`/photographers/${photographerId}/photos`);
  if (!res.ok) throw new Error('Gagal mengambil foto fotografer');
  return res.json();
}

