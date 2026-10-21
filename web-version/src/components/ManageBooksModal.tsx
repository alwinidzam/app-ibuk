import { useState } from 'react';
import { Sheet } from './Sheet';
import { defaultCategoriesForNewBook, type Book } from '../books';
import { db } from '../db';
import { haptic } from '../device';
import {
  BookSvgIcon,
  CheckCircleIcon,
  CloseIcon,
  PenToolIcon,
  PlusIcon,
  TrashIcon,
} from './SvgIcons';

interface Props {
  books: Book[];
  activeBookId: string;
  onClose: () => void;
  onBooksChanged: (updatedBooks: Book[], newActiveId?: string) => void;
}

const AVAILABLE_ICONS = [
  { id: 'school', label: 'Sekolah' },
  { id: 'mother', label: 'Ibu-Ibu' },
  { id: 'home', label: 'Rumah' },
  { id: 'building', label: 'Masjid/Gedung' },
  { id: 'store', label: 'Toko/Usaha' },
  { id: 'heart', label: 'Sosial/Santunan' },
  { id: 'star', label: 'Proyek' },
  { id: 'tag', label: 'Umum' },
];

const AVAILABLE_COLORS = [
  '#0A84FF', // Apple Blue
  '#AF52DE', // Apple Purple
  '#34C759', // Apple Green
  '#FF9500', // Apple Orange
  '#FF3B30', // Apple Red
  '#30B0C7', // Apple Teal
  '#F59E0B', // Amber
];

export function ManageBooksModal({ books, activeBookId, onClose, onBooksChanged }: Props) {
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('building');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const startAdd = () => {
    haptic(10);
    setEditingBookId(null);
    setName('');
    setShort('');
    setSelectedIcon('building');
    setSelectedColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
    setIsFormOpen(true);
  };

  const startEdit = (book: Book) => {
    haptic(10);
    setEditingBookId(book.id);
    setName(book.name);
    setShort(book.short);
    setSelectedIcon(book.icon || 'tag');
    setSelectedColor(book.accentColor || AVAILABLE_COLORS[0]);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Mohon isi nama buku kas.');
      return;
    }
    const shortLabel = short.trim() || name.trim().slice(0, 10);

    haptic([15, 30]);

    if (editingBookId) {
      // Update existing book
      const updated = books.map((b) =>
        b.id === editingBookId
          ? {
              ...b,
              name: name.trim(),
              short: shortLabel,
              icon: selectedIcon,
              accentColor: selectedColor,
            }
          : b
      );
      onBooksChanged(updated);
    } else {
      // Create new unique ID
      const baseSlug = shortLabel.toLowerCase().replace(/[^a-z0-9]/g, '') || 'buku';
      const uniqueId = `${baseSlug}_${Date.now().toString(36)}`;

      const newBook: Book = {
        id: uniqueId,
        short: shortLabel,
        name: name.trim(),
        icon: selectedIcon,
        accentColor: selectedColor,
        categories: defaultCategoriesForNewBook(),
      };

      const updated = [...books, newBook];
      onBooksChanged(updated, newBook.id);
    }

    setIsFormOpen(false);
    setEditingBookId(null);
  };

  const handleDelete = async (book: Book) => {
    if (books.length <= 1) {
      alert('Tidak dapat menghapus. Minimal harus ada 1 buku kas aktif.');
      return;
    }

    // Check transaction count in this book
    const count = await db.tx.where('book').equals(book.id).count();

    const confirmMsg =
      count > 0
        ? `Buku "${book.name}" memiliki ${count} catatan transaksi. Yakin ingin menghapus buku ini beserta seluruh catatannya?`
        : `Yakin ingin menghapus buku "${book.name}"?`;

    if (confirm(confirmMsg)) {
      haptic(25);
      // Delete transactions belonging to this book
      if (count > 0) {
        await db.tx.where('book').equals(book.id).delete();
      }

      const updated = books.filter((b) => b.id !== book.id);
      const nextActive = activeBookId === book.id ? updated[0].id : activeBookId;
      onBooksChanged(updated, nextActive);
    }
  };

  return (
    <Sheet title="Kelola Buku Kas" onClose={onClose} dismissible>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--label-secondary)', lineHeight: 1.4, marginBottom: 14 }}>
          Ibuk bisa menambah, mengubah, atau menghapus buku kas sesuai kebutuhan (misal: Kas Masjid, Kas Arisan, Kas Toko, dll).
        </p>

        {/* Existing Books List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {books.map((b) => {
            const isCurrent = b.id === activeBookId;
            return (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F8FAFC',
                  padding: '12px 14px',
                  borderRadius: 16,
                  border: isCurrent ? `1.5px solid ${b.accentColor || '#0A84FF'}` : '1px solid var(--hairline)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: isCurrent ? (b.accentColor || '#0A84FF') : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCurrent ? '#FFFFFF' : '#374151',
                    }}
                  >
                    <BookSvgIcon icon={b.icon || b.id} size={20} color={isCurrent ? '#FFFFFF' : '#374151'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--label-primary)' }}>
                      {b.name}
                      {isCurrent && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: b.accentColor || '#0A84FF',
                            color: '#FFFFFF',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          Aktif
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--label-secondary)' }}>Tab: {b.short}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => startEdit(b)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--apple-blue)',
                      cursor: 'pointer',
                    }}
                    title="Ubah Buku Kas"
                    aria-label={`Ubah ${b.name}`}
                  >
                    <PenToolIcon size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={books.length <= 1}
                    onClick={() => handleDelete(b)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: books.length <= 1 ? '#D1D5DB' : 'var(--apple-red)',
                      cursor: books.length <= 1 ? 'not-allowed' : 'pointer',
                    }}
                    title="Hapus Buku Kas"
                    aria-label={`Hapus ${b.name}`}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Drawer (Add / Edit) */}
        {isFormOpen ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--apple-blue)',
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--label-primary)' }}>
                {editingBookId ? 'Ubah Buku Kas' : 'Tambah Buku Kas Baru'}
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--label-secondary)', cursor: 'pointer' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="form-field-group">
              <label className="field-label">Nama Lengkap Buku Kas</label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Kas Masjid Al-Ikhlas, Kas RT 05..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              <label className="field-label">Nama Singkat di Tab (Maks. 10 Karakter)</label>
              <input
                type="text"
                maxLength={12}
                className="text-input"
                placeholder="Contoh: Masjid, RT 05, Toko"
                value={short}
                onChange={(e) => setShort(e.target.value)}
              />
            </div>

            {/* Icon Picker */}
            <div className="form-field-group">
              <label className="field-label">Pilih Ikon Buku</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {AVAILABLE_ICONS.map((ic) => {
                  const isSelected = selectedIcon === ic.id;
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => {
                        haptic(10);
                        setSelectedIcon(ic.id);
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid var(--apple-blue)' : '1px solid var(--hairline)',
                        background: isSelected ? '#F0F9FF' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <BookSvgIcon icon={ic.id} size={20} color={isSelected ? 'var(--apple-blue)' : '#4B5563'} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'var(--apple-blue)' : '#4B5563' }}>
                        {ic.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="form-field-group">
              <label className="field-label">Pilih Warna Aksen</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {AVAILABLE_COLORS.map((col) => {
                  const isSelected = selectedColor === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        haptic(10);
                        setSelectedColor(col);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: col,
                        border: isSelected ? '3px solid #000000' : '2px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      aria-label={`Warna ${col}`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="primary-action-btn in"
              onClick={handleSave}
              style={{ marginTop: 12 }}
            >
              <CheckCircleIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
              <span>{editingBookId ? 'SIMPAN PERUBAHAN' : 'TAMBAH BUKU KAS'}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="primary-action-btn in"
            onClick={startAdd}
            style={{
              background: '#F0F9FF',
              color: 'var(--apple-blue)',
              border: '1.5px dashed var(--apple-blue)',
              boxShadow: 'none',
              marginBottom: 10,
            }}
          >
            <PlusIcon size={18} color="var(--apple-blue)" strokeWidth={2.5} />
            <span>+ Tambah Buku Kas Baru</span>
          </button>
        )}
      </div>
    </Sheet>
  );
}
