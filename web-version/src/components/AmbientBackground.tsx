import type { BookId } from '../money';

interface Props {
  book: BookId;
}

// Anti-AI-slop: Eliminated heavy GPU blur orbs to ensure 100% WCAG contrast and zero lag
export function AmbientBackground({ book: _book }: Props) {
  return null;
}
