// Icônes en trait, sans dépendance externe. Décoratives par défaut (aria-hidden).
type P = { size?: number; color?: string };

const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const });

export const IconHome = ({ size = 24, color = 'currentColor' }: P) => (
  <svg {...base(size)}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg>
);
export const IconSearch = ({ size = 24, color = 'currentColor' }: P) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="2" /><path d="M20 20l-4-4" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
);
export const IconPlus = ({ size = 26, color = '#fff' }: P) => (
  <svg {...base(size)}><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.6" strokeLinecap="round" /></svg>
);
export const IconChat = ({ size = 24, color = 'currentColor' }: P) => (
  <svg {...base(size)}><path d="M4 5h16v11H9l-5 4z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" /></svg>
);
export const IconUser = ({ size = 24, color = 'currentColor' }: P) => (
  <svg {...base(size)}><circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth="2" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
);
export const IconShield = ({ size = 24, color = '#fff' }: P) => (
  <svg {...base(size)} style={{ flexShrink: 0 }}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconBack = ({ size = 22, color = 'currentColor' }: P) => (
  <svg {...base(size)}><path d="M15 5l-7 7 7 7" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconVerified = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Vendeur vérifié"><circle cx="12" cy="12" r="10" fill="#E9A23B" /><path d="M8 12l3 3 5-6" fill="none" stroke="#1E1A16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Logo = ({ size = 44 }: P) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="#B9491F" />
    <g fill="none" stroke="#F6EFE4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 29 A17 17 0 0 1 45 21" /><path d="M38 17 L46 21 L42 29" />
      <path d="M49 35 A17 17 0 0 1 19 43" /><path d="M26 47 L18 43 L22 35" />
    </g>
  </svg>
);
