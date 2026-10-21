import { useState, useRef } from 'react';
import { Sheet } from './Sheet';
import { parseAmount, rupiah, todayISO, type BookId, type Tx, type TxType } from '../money';
import { bookById } from '../books';
import { compressImage, haptic } from '../device';
import { ArrowDownIcon, ArrowUpIcon, CameraIcon, CategorySvgIcon, CheckCircleIcon, TrashIcon } from './SvgIcons';

interface Props {
  bookId: BookId;
  initialType: TxType;
  txToEdit?: Tx;
  onClose: () => void;
  onSave: (tx: Tx, photo: string | null | undefined) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function TransactionModal({
  bookId,
  initialType,
  txToEdit,
  onClose,
  onSave,
  onDelete
}: Props) {
  const book = bookById(bookId);
  const [type, setType] = useState<TxType>(txToEdit ? txToEdit.type : initialType);
  const [amount, setAmount] = useState<number>(txToEdit ? txToEdit.amount : 0);
  const [amountStr, setAmountStr] = useState<string>(txToEdit ? String(txToEdit.amount) : '');
  
  const defaultCategory = txToEdit ? txToEdit.category : book.categories[type][0]?.name || 'Lainnya';
  const [category, setCategory] = useState<string>(defaultCategory);
  const [note, setNote] = useState<string>(txToEdit ? txToEdit.note : '');
  const [date, setDate] = useState<string>(txToEdit ? txToEdit.date : todayISO());
  
  // Photo state: undefined = unchanged, null = removed, string = new/modified base64
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = book.categories[type];

  // Quick nominal buttons
  const handleAddNominal = (add: number) => {
    haptic(10);
    const next = amount + add;
    setAmount(next);
    setAmountStr(String(next));
  };

  const handleAmountChange = (val: string) => {
    const num = parseAmount(val);
    setAmount(num);
    setAmountStr(num > 0 ? String(num) : '');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      haptic(15);
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setPhotoPreview(compressed);
    } catch {
      alert('Gagal memproses foto nota.');
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic(10);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      alert('Mohon masukkan nominal uang.');
      return;
    }
    setSaving(true);
    try {
      haptic([15, 30, 15]);
      const tx: Tx = {
        id: txToEdit?.id,
        book: bookId,
        type,
        amount,
        category,
        note: note.trim(),
        date,
        hasPhoto: txToEdit?.hasPhoto ?? false,
        createdAt: txToEdit?.createdAt ?? Date.now()
      };
      await onSave(tx, photo);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!txToEdit?.id || !onDelete) return;
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      haptic(20);
      await onDelete(txToEdit.id);
      onClose();
    }
  };

  const title = txToEdit
    ? 'Ubah Catatan'
    : type === 'in'
    ? 'Catat Uang Masuk'
    : 'Catat Uang Keluar';

  return (
    <Sheet
      title={title}
      onClose={onClose}
      action={
        txToEdit && onDelete ? (
          <button type="button" className="bar-btn danger" onClick={handleDelete} aria-label="Hapus Catatan">
            <TrashIcon size={18} />
          </button>
        ) : undefined
      }
    >
      {/* Switcher Masuk / Keluar if creating new */}
      {!txToEdit && (
        <div className="segmented-control" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`segment-item ${type === 'in' ? 'active' : ''}`}
            onClick={() => {
              haptic(10);
              setType('in');
              setCategory(book.categories.in[0]?.name || 'Lainnya');
            }}
          >
            <ArrowDownIcon size={16} color={type === 'in' ? '#10B981' : '#64748B'} strokeWidth={2.4} />
            <span>Uang Masuk</span>
          </button>
          <button
            type="button"
            className={`segment-item ${type === 'out' ? 'active' : ''}`}
            onClick={() => {
              haptic(10);
              setType('out');
              setCategory(book.categories.out[0]?.name || 'Lainnya');
            }}
          >
            <ArrowUpIcon size={16} color={type === 'out' ? '#EF4444' : '#64748B'} strokeWidth={2.4} />
            <span>Uang Keluar</span>
          </button>
        </div>
      )}

      {/* Big Amount Display Box */}
      <div className="amount-display-box">
        <div className="amount-label">Jumlah Uang ({type === 'in' ? 'Masuk' : 'Keluar'})</div>
        <div className={`amount-hero-text tnum ${type}`}>
          {amount > 0 ? rupiah(amount) : 'Rp 0'}
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ketik nominal..."
          className="text-input tnum"
          style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginTop: 12 }}
          value={amountStr ? rupiah(parseAmount(amountStr)) : ''}
          onChange={(e) => handleAmountChange(e.target.value)}
          autoFocus={!txToEdit}
        />
      </div>

      {/* Quick Add Chips */}
      <div className="quick-chips">
        <button type="button" className="chip-btn" onClick={() => handleAddNominal(10_000)}>
          +10 rb
        </button>
        <button type="button" className="chip-btn" onClick={() => handleAddNominal(20_000)}>
          +20 rb
        </button>
        <button type="button" className="chip-btn" onClick={() => handleAddNominal(50_000)}>
          +50 rb
        </button>
        <button type="button" className="chip-btn" onClick={() => handleAddNominal(100_000)}>
          +100 rb
        </button>
        <button type="button" className="chip-btn" onClick={() => handleAddNominal(500_000)}>
          +500 rb
        </button>
        <button
          type="button"
          className="chip-btn"
          style={{ color: 'var(--apple-red)' }}
          onClick={() => {
            haptic(10);
            setAmount(0);
            setAmountStr('');
          }}
        >
          Hapus
        </button>
      </div>

      {/* Category Grid */}
      <div className="category-section-title">Pilih Kategori</div>
      <div className="category-grid">
        {categories.map((c) => {
          const isActive = category === c.name;
          const tileColor = isActive
            ? type === 'in' ? '#10B981' : '#EF4444'
            : '#64748B';
          return (
            <button
              key={c.name}
              type="button"
              className={`category-tile ${isActive ? 'active' : ''}`}
              onClick={() => {
                haptic(10);
                setCategory(c.name);
              }}
            >
              <span className="tile-emoji">
                <CategorySvgIcon name={c.name} size={22} color={tileColor} />
              </span>
              <span className="tile-name">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Note / Keterangan */}
      <div className="form-field-group">
        <label className="field-label">Keterangan / Catatan Tambahan (Opsional)</label>
        <input
          type="text"
          className="text-input"
          placeholder="Misal: Iuran bu RT bulan Oktober, beli spidol..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="form-field-group">
        <label className="field-label">Tanggal Transaksi</label>
        <input
          type="date"
          className="date-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Receipt Photo Upload */}
      <div className="form-field-group">
        <label className="field-label">Foto Bukti Nota / Kwitansi (Tersimpan di HP)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          className={`photo-uploader-box ${photoPreview ? 'has-photo' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <div style={{ textAlign: 'center' }}>
              <img src={photoPreview} alt="Bukti Nota" className="preview-thumb" />
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="bar-btn danger"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={handleRemovePhoto}
                >
                  <TrashIcon size={16} /> Hapus Foto
                </button>
              </div>
            </div>
          ) : (
            <>
              <CameraIcon size={28} color="var(--apple-blue)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {txToEdit?.hasPhoto
                  ? 'Foto tersimpan (Ketuk untuk ganti)'
                  : 'Ketuk untuk Ambil Foto / Pilih dari Galeri'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Primary Save Button */}
      <button
        type="button"
        disabled={saving || amount <= 0}
        className={`primary-action-btn ${type}`}
        onClick={handleSubmit}
      >
        <CheckCircleIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
        <span>{saving ? 'Menyimpan...' : 'SIMPAN CATATAN'}</span>
      </button>
    </Sheet>
  );
}
