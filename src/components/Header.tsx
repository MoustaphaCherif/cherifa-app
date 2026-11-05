import { useNavigate } from 'react-router-dom';
import { IconBack } from './Icons';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button type="button" onClick={() => navigate(-1)} aria-label="Retour"
        style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, border: '1px solid var(--bord)', background: 'var(--blanc)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <IconBack />
      </button>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontSize: 13, color: 'var(--texte-3)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}
