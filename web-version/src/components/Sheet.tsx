import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  /** Trailing toolbar action (e.g. Delete icon). */
  action?: ReactNode;
  /** Tapping outside closes. */
  dismissible?: boolean;
  children: ReactNode;
}

/** iOS-style bottom sheet on the native <dialog>: drag-down swipe to dismiss, backdrop tap, Esc / back gesture. */
export function Sheet({ title, onClose, action, dismissible = true, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number>(0);

  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) {
      currentY.current = dy;
      if (innerRef.current) {
        innerRef.current.style.transform = `translateY(${dy}px)`;
        innerRef.current.style.transition = 'none';
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (currentY.current > 60) {
      if (innerRef.current) {
        innerRef.current.style.transform = 'translateY(100%)';
        innerRef.current.style.transition = 'transform 0.18s ease-out';
      }
      setTimeout(() => {
        ref.current?.close();
      }, 160);
    } else {
      if (innerRef.current) {
        innerRef.current.style.transform = 'translateY(0px)';
        innerRef.current.style.transition = 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.15)';
      }
    }
    startY.current = null;
    currentY.current = 0;
  };

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => (dismissible || e.target === ref.current) && e.target === ref.current && ref.current?.close()}
    >
      <div ref={innerRef} className="sheet-inner">
        {/* iOS Grabber Handle & Drag Zone */}
        <div
          style={{
            width: '100%',
            paddingTop: 10,
            paddingBottom: 6,
            display: 'flex',
            justifyContent: 'center',
            cursor: 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div style={{ width: 36, height: 5, borderRadius: 2.5, backgroundColor: '#D1D1D6' }} />
        </div>

        <header
          className="sheet-bar"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ position: 'relative', justifyContent: 'center', touchAction: 'none' }}
        >
          <h2>{title}</h2>
          {action && <div className="bar-end" style={{ position: 'absolute', right: 20 }}>{action}</div>}
        </header>

        <div className="sheet-body">{children}</div>
      </div>
    </dialog>
  );
}
