import { haptic } from '../device';
import type { TxType } from '../money';
import { ArrowDownIcon, ArrowUpIcon, DocumentTextIcon } from './SvgIcons';

interface Props {
  onOpenCreate: (type: TxType) => void;
  onOpenReport: () => void;
}

export function FloatingDock({ onOpenCreate, onOpenReport }: Props) {
  return (
    <div className="floating-dock-container">
      <nav className="floating-dock" aria-label="Menu Aksi Cepat">
        <button
          type="button"
          className="dock-btn income"
          onClick={() => {
            haptic(15);
            onOpenCreate('in');
          }}
        >
          <ArrowDownIcon size={18} color="#FFFFFF" strokeWidth={2} />
          <span>Masuk</span>
        </button>

        <button
          type="button"
          className="dock-btn expense"
          onClick={() => {
            haptic(15);
            onOpenCreate('out');
          }}
        >
          <ArrowUpIcon size={18} color="#FFFFFF" strokeWidth={2} />
          <span>Keluar</span>
        </button>

        <button
          type="button"
          className="dock-btn report"
          onClick={() => {
            haptic(10);
            onOpenReport();
          }}
        >
          <DocumentTextIcon size={18} color="var(--label-primary)" strokeWidth={2} />
          <span>Laporan</span>
        </button>
      </nav>
    </div>
  );
}
