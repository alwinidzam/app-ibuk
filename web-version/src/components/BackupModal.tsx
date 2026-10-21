import { useState, useRef } from 'react';
import { Sheet } from './Sheet';
import { exportAll, replaceAll } from '../db';
import { parseBackup } from '../backup';
import { downloadBlob, haptic } from '../device';
import { todayISO } from '../money';
import { CheckCircleIcon, DocumentTextIcon, InfoIcon, ShareIcon } from './SvgIcons';

interface Props {
  onClose: () => void;
  onRestored: () => void;
}

export function BackupModal({ onClose, onRestored }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    haptic(15);
    setBusy(true);
    setMsg(null);
    try {
      const data = await exportAll();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, `Cadangan_Buku_Kas_Ibuk_${todayISO()}.json`);
      setMsg({ type: 'ok', text: 'File cadangan berhasil diunduh. Simpan file ini di WhatsApp anak atau Google Drive.' });
    } catch {
      setMsg({ type: 'err', text: 'Gagal membuat file cadangan.' });
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptic(15);
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const parsed = parseBackup(text);
      if (confirm(`Pulihkan ${parsed.transactions.length} catatan transaksi? Data yang ada di HP sekarang akan diganti dengan file cadangan ini.`)) {
        await replaceAll(parsed);
        setMsg({ type: 'ok', text: 'Data berhasil dipulihkan dengan sempurna!' });
        onRestored();
      }
    } catch (err) {
      setMsg({ type: 'err', text: (err as Error).message || 'File cadangan tidak valid.' });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Sheet title="Cadangkan & Pulihkan Data" onClose={onClose} dismissible>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Semua catatan dan foto nota tersimpan <strong>100% aman di dalam HP ibuk</strong> tanpa server internet.
        </div>
      </div>

      {msg && (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            background: msg.type === 'ok' ? 'var(--apple-green-bg)' : 'var(--apple-red-bg)',
            color: msg.type === 'ok' ? 'var(--apple-green)' : 'var(--apple-red)',
            border: `1px solid ${msg.type === 'ok' ? 'var(--apple-green-border)' : 'var(--apple-red-border)'}`
          }}
        >
          {msg.type === 'ok' ? <CheckCircleIcon size={20} color="var(--apple-green)" /> : <InfoIcon size={20} color="var(--apple-red)" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Backup Section */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          1. Cadangkan Semua Data (Simpan File)
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Unduh file cadangan yang berisi seluruh catatan dari 3 buku kas beserta foto notanya. Kirim file ini ke WhatsApp anak sebagai arsip aman.
        </p>
        <button
          type="button"
          className="dock-btn income"
          style={{ width: '100%', height: 50, fontSize: 16 }}
          disabled={busy}
          onClick={handleBackup}
        >
          <ShareIcon size={18} color="#FFFFFF" strokeWidth={2} />
          <span>{busy ? 'Memproses...' : 'Unduh File Cadangan'}</span>
        </button>
      </div>

      {/* Restore Section */}
      <div className="glass-card" style={{ padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          2. Pulihkan Data dari File
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Jika ibuk berganti HP atau ingin mengembalikan catatan dari file cadangan sebelumnya:
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleRestoreFile}
        />
        <button
          type="button"
          className="dock-btn report"
          style={{ width: '100%', height: 50, fontSize: 16 }}
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <DocumentTextIcon size={18} color="var(--text-primary)" />
          <span>Pilih File untuk Dipulihkan</span>
        </button>
      </div>
    </Sheet>
  );
}
