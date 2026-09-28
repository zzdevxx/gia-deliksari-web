import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * Mock lucide-react so each icon renders as a tiny <svg data-testid="icon-Name" />.
 * Tests stay fast (no thousands of SVG paths) and we can assert on icon presence.
 *
 * Static list — add new icons here as components import them. Easier than
 * a Proxy (which Vitest factory resolvers don't accept cleanly).
 */
const MockIcon = ({ name, ...props }: { name: string } & Record<string, unknown>) => (
  <svg data-testid={`icon-${name}`} {...props} />
);

const ICONS = [
  'KeyRound',
  'ArrowLeft',
  'ShieldCheck',
  'Edit2',
  'Trash2',
  'Users',
  'Power',
  'Plus',
  'ScrollText',
  'RefreshCw',
  'Search',
  'ChevronLeft',
  'ChevronRight',
  'X',
  // extras commonly used elsewhere in the app
  'Bell',
  'Calendar',
  'CheckCircle2',
  'Clock',
  'Flame',
  'Baby',
  'HeartHandshake',
  'Hourglass',
  'LogOut',
  'Printer',
  'ExternalLink',
  'Sparkles',
  'ChevronRight',
  'ChevronLeft',
  'Filter',
  'Pin',
  'Calendar',
  'User',
  'Tag',
  'FileText',
  'CheckSquare',
  'Square',
  'MapPin',
  'PackageCheck',
  'Video',
  'Image',
];

vi.mock('lucide-react', () => {
  const map: Record<string, unknown> = { __esModule: true };
  for (const name of ICONS) {
    map[name] = ({ ...props }: Record<string, unknown>) => (
      <MockIcon name={name} {...props} />
    );
  }
  return map;
});