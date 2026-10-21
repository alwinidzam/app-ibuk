import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { db } from '../db';

interface Props {
  photoId: number;
  onClose: () => void;
}

export function ReceiptModal({ photoId, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.photos
      .get(photoId)
      .then((p) => {
        setDataUrl(p?.dataUrl ?? null);
      })
      .finally(() => setLoading(false));
  }, [photoId]);

  return (
    <Sheet title="Foto Bukti Nota / Kwitansi" onClose={onClose} dismissible>
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        {loading ? (
          <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Memuat foto...</div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="Bukti Nota Penuh"
            style={{
              maxWidth: '100%',
              maxHeight: '65vh',
              borderRadius: 16,
              objectFit: 'contain',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}
          />
        ) : (
          <div style={{ padding: 40, color: 'var(--text-secondary)' }}>
            Foto tidak ditemukan di penyimpanan lokal.
          </div>
        )}
      </div>
    </Sheet>
  );
}
