export interface EventItem {
  id: number;
  name: string;
  event_date: string;
  price: number;
  location?: string;
  description?: string;
  organizer_wa?: string;
  bank_info?: string;
  cover_url?: string;
  photo_count?: number;
  created_at: string;
}

export interface PhotoFace {
  id: string;
  box: { x: number; y: number; width: number; height: number }; // normalized 0-1
  confidence: number;
  embedding: number[]; // 512-dim or 128-dim normalized vector
  bib_candidate?: string;
}

export interface PhotoItem {
  id: number;
  event_id: number;
  filename: string;
  original_url: string;
  preview_url: string; // watermarked preview
  thumbnail_url: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  bib_number?: string;
  secondary_bibs?: string[];
  ocr_confidence?: number;
  faces: PhotoFace[];
  captured_at?: string;
  camera_info?: string;
  width: number;
  height: number;
  created_at: string;
  // Photographer attribution:
  photographer_id?: number;
  photographer_name?: string;
  photographer_instagram?: string;
  // Computed during selfie search:
  match_confidence?: number;
}

export interface PhotographerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  gear?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'suspended';
  token?: string;
  photo_count?: number;
  total_sales_count?: number;
  created_at: string;
}

export interface EventStatus {
  total: number;
  pending: number;
  processing: number;
  done: number;
  failed: number;
}

export interface OrderItem {
  id: number;
  order_number: string;
  event_id: number;
  event_name?: string;
  photo_ids: number[];
  photos?: PhotoItem[];
  total_amount: number;
  runner_name: string;
  runner_phone: string;
  runner_bib?: string;
  status: 'pending' | 'paid' | 'cancelled';
  wa_text: string;
  wa_link: string;
  download_token?: string;
  download_expires_at?: string;
  created_at: string;
}

export interface DownloadTokenData {
  token: string;
  order_id: number;
  order_number?: string;
  event_id: number;
  event_name: string;
  runner_name: string;
  runner_bib?: string;
  photos: PhotoItem[];
  expires_at: string;
  is_expired?: boolean;
}

export interface AppSettings {
  admin_key: string;
  face_threshold: number; // default 0.40
  ocr_min_conf: number;   // default 0.45
  organizer_wa: string;
  bank_details: string;
}
