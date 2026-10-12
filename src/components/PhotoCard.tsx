import React from 'react';
import { ZoomIn, Check, Plus, Sparkles, Clock, Camera } from 'lucide-react';
import { PhotoItem } from '../types';
import { WatermarkedImage } from './WatermarkedImage';

interface PhotoCardProps {
  photo: PhotoItem;
  isSelected: boolean;
  onToggleSelect: (photo: PhotoItem) => void;
  onOpenPreview: (photo: PhotoItem) => void;
  price: number;
  eventName: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isSelected,
  onToggleSelect,
  onOpenPreview,
  price,
  eventName,
}) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div
      className={`group relative bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-500/30 shadow-xl shadow-orange-500/10'
          : 'border-neutral-800 hover:border-neutral-700 hover:shadow-lg'
      }`}
    >
      {/* Photo Preview Container with Watermarking */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-950">
        <WatermarkedImage
          src={photo.thumbnail_url || photo.preview_url}
          alt={`Foto Lari ${photo.bib_number ? `Bib ${photo.bib_number}` : ''}`}
          eventTitle={eventName}
          bibNumber={photo.bib_number}
          className="w-full h-full"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={() => onOpenPreview(photo)}
            className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-xl transition-transform hover:scale-110 shadow-lg border border-neutral-700"
            title="Perbesar Preview"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onToggleSelect(photo)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-105 shadow-lg ${
              isSelected
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Dipilih
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Pilih Foto
              </>
            )}
          </button>
        </div>

        {/* Match Confidence Badge (when searching by face) */}
        {photo.match_confidence !== undefined && (
          <div className="absolute top-3 left-3 z-20">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {Math.round(photo.match_confidence * 100)}% Cocok
            </span>
          </div>
        )}

        {/* Checkbox badge on top-right */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(photo);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/40 ring-2 ring-white/30'
                : 'bg-black/50 text-white/60 hover:text-white hover:bg-black/80 backdrop-blur-md border border-white/20'
            }`}
          >
            <Check className={`w-4 h-4 transition-transform ${isSelected ? 'scale-100' : 'scale-75 opacity-0 hover:opacity-100'}`} />
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5 bg-neutral-900">
        
        {/* Info header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-white">
              {photo.bib_number ? `BIB #${photo.bib_number}` : 'BIB Tidak Terbaca'}
            </span>
            {photo.secondary_bibs && photo.secondary_bibs.length > 0 && (
              <span className="text-neutral-500 text-[10px]">
                (+{photo.secondary_bibs.join(', ')})
              </span>
            )}
          </div>
          <span className="text-orange-400 font-extrabold font-mono text-xs">
            {formattedPrice}
          </span>
        </div>

        {/* Unboxed Metadata (camera & timestamp) */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 truncate">
          <span className="flex items-center gap-1 truncate">
            <Camera className="w-3 h-3 text-neutral-500 shrink-0" />
            <span className="truncate">{photo.camera_info || 'Kamera Pro'}</span>
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-neutral-500" />
            <span>{photo.captured_at ? photo.captured_at.split(' ')[1] : '07:15'}</span>
          </span>
        </div>

        {/* Photographer attribution credit */}
        {photo.photographer_name && (
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono truncate bg-neutral-950/60 px-2 py-1 rounded-lg border border-neutral-800/80">
            <span className="text-orange-400 text-xs">📸</span>
            <span className="truncate text-neutral-300 font-medium">{photo.photographer_name}</span>
          </div>
        )}

        {/* Quick Add Button */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <button
            onClick={() => onOpenPreview(photo)}
            className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Detail Foto
          </button>
          <button
            onClick={() => onToggleSelect(photo)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              isSelected
                ? 'bg-neutral-800 text-orange-400'
                : 'text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800'
            }`}
          >
            {isSelected ? 'Batalkan' : '+ Tambah'}
          </button>
        </div>

      </div>
    </div>
  );
};
