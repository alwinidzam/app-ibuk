import { useState, useEffect } from 'react';
import { Sheet } from './Sheet';
import { bookById } from '../books';
import { longDate, rupiah, type Tx } from '../money';
import { db } from '../db';
import { haptic } from '../device';
import {
  CategorySvgIcon,
  ImageIcon,
  PenToolIcon,
  TrashIcon,
  WhatsAppIcon,
} from './SvgIcons';

interface Props {
  tx: Tx;
  onClose: () => void;
  onEdit: (tx: Tx) => void;
  onDelete: (id: number) => Promise<void> | void;
  onViewPhoto: (photoId: number) => void;
}

export function TransactionDetailModal({
  tx,
  onClose,
  onEdit,
  onDelete,
  onViewPhoto,
}: Props) {
  const [photoThumb, setPhotoThumb] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const book = bookById(tx.book);
  const isIncome = tx.type === 'in';
  const themeColor = isIncome ? '#059669' : '#DC2626';

  useEffect(() => {
    if (tx.hasPhoto && tx.id !== undefined) {
      db.photos
        .get(tx.id)
        .then((p) => {
          if (p?.dataUrl) {
            setPhotoThumb(p.dataUrl);
          }
        })
        .catch(() => {});
    }
  }, [tx.hasPhoto, tx.id]);

  const handleShareWhatsApp = () => {
    haptic(10);
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const text =
      `*BUKTI CATATAN KAS IBUK*\n` +
      `Buku: ${book.name}\n` +
      `---------------------------\n` +
      `Kategori: ${tx.category}\n` +
      `Tipe: ${typeLabel}\n` +
      `Nominal: ${isIncome ? '+' : '−'}${rupiah(tx.amount)}\n` +
      `Tanggal: ${longDate(tx.date)}\n` +
      (tx.note ? `Keterangan: ${tx.note}\n` : '') +
      `---------------------------\n` +
      `_Tercatat aman di aplikasi Buku Kas Ibuk_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!tx.id) return;
    try {
      setDeleting(true);
      haptic(20);
      await onDelete(tx.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Sheet title="Rincian Catatan Kas" onClose={onClose} dismissible>
      <div className="tx-detail-content">
        {/* Hero Section */}
        <div className="tx-detail-hero">
          <div
            className="tx-detail-icon-bubble"
            style={{
              backgroundColor: isIncome ? '#ECFDF5' : '#FEF2F2',
              color: themeColor,
            }}
          >
            <CategorySvgIcon name={tx.category} size={30} color={themeColor} />
          </div>

          <div className="tx-detail-category">{tx.category}</div>

          <div className="tx-detail-book-badge">
            <span>{book.name}</span>
          </div>

          <div
            className="tx-detail-amount tnum"
            style={{ color: themeColor }}
          >
            {isIncome ? '+' : '−'}
            {rupiah(tx.amount)}
          </div>

          <div className="tx-detail-type-sub">
            {isIncome ? 'Uang Masuk Kas' : 'Uang Keluar Kas'}
          </div>
        </div>

        {/* Inset Grouped Metadata Card */}
        <div className="tx-detail-section-title">INFORMASI LENGKAP</div>
        <div className="tx-detail-card">
          <div className="tx-detail-row">
            <span className="tx-detail-label">Tanggal</span>
            <span className="tx-detail-value">{longDate(tx.date)}</span>
          </div>

          <div className="tx-detail-hairline" />

          <div className="tx-detail-row">
            <span className="tx-detail-label">Kategori</span>
            <span className="tx-detail-value">{tx.category}</span>
          </div>

          <div className="tx-detail-hairline" />

          <div className="tx-detail-row">
            <span className="tx-detail-label">Tipe Transaksi</span>
            <span
              className="tx-detail-value"
              style={{ color: themeColor, fontWeight: 700 }}
            >
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </div>

          {tx.note && (
            <>
              <div className="tx-detail-hairline" />
              <div className="tx-detail-row column">
                <span className="tx-detail-label">Keterangan / Catatan</span>
                <p className="tx-detail-note-text">{tx.note}</p>
              </div>
            </>
          )}
        </div>

        {/* Receipt Photo Card if Attached */}
        {tx.hasPhoto && tx.id !== undefined && (
          <>
            <div className="tx-detail-section-title">BUKTI NOTA / KWITANSI</div>
            <div
              className="tx-detail-photo-card"
              onClick={() => {
                haptic(10);
                if (tx.id !== undefined) onViewPhoto(tx.id);
              }}
              role="button"
              tabIndex={0}
            >
              {photoThumb ? (
                <img
                  src={photoThumb}
                  alt="Bukti Nota"
                  className="tx-detail-photo-thumb"
                />
              ) : (
                <div className="tx-detail-photo-placeholder">
                  <ImageIcon size={22} color="#0A84FF" />
                </div>
              )}
              <div className="tx-detail-photo-info">
                <div className="tx-detail-photo-title">
                  <ImageIcon size={14} color="#0A84FF" />
                  <span>Foto Nota Tersimpan</span>
                </div>
                <span className="tx-detail-photo-hint">
                  Ketuk untuk memperbesar foto penuh
                </span>
              </div>
            </div>
          </>
        )}

        {/* Deliberate Action Buttons Stack */}
        <div className="tx-detail-actions">
          {/* Edit Button */}
          <button
            type="button"
            className="tx-detail-btn edit"
            onClick={() => {
              haptic(10);
              onClose();
              onEdit(tx);
            }}
          >
            <PenToolIcon size={18} color="#0A84FF" strokeWidth={2.2} />
            <span>Ubah Rincian Catatan</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            className="tx-detail-btn share"
            onClick={handleShareWhatsApp}
          >
            <WhatsAppIcon size={18} color="#059669" strokeWidth={2} />
            <span>Bagikan Bukti ke WhatsApp</span>
          </button>

          {/* Delete Action with 2-Step Confirmation */}
          {!confirmingDelete ? (
            <button
              type="button"
              className="tx-detail-btn delete"
              onClick={() => {
                haptic(15);
                setConfirmingDelete(true);
              }}
            >
              <TrashIcon size={18} color="#DC2626" strokeWidth={2} />
              <span>Hapus Catatan Ini</span>
            </button>
          ) : (
            <div className="tx-detail-confirm-box">
              <div className="tx-confirm-header">
                <strong>Hapus Catatan Ini?</strong>
                <p>
                  Catatan <b>{tx.category}</b> sebesar{' '}
                  <b>{rupiah(tx.amount)}</b> akan dihapus permanen. Tindakan ini
                  tidak dapat dibatalkan.
                </p>
              </div>

              <div className="tx-confirm-actions">
                <button
                  type="button"
                  className="tx-confirm-cancel-btn"
                  onClick={() => {
                    haptic(10);
                    setConfirmingDelete(false);
                  }}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="tx-confirm-delete-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus Catatan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
