import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Icons';
import { brand } from '../config/brand';
import { isDemoMode, supabase } from '../lib/supabase';

const countries = [
  { code: '+221', label: 'Sénégal', placeholder: '77 123 45 67' },
  { code: '+33', label: 'France', placeholder: '6 12 34 56 78' },
];

export function Bienvenue() {
  const navigate = useNavigate();
  const [countryIdx, setCountryIdx] = useState(0);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const country = countries[countryIdx];

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setError('Vérifie ton numéro : il manque des chiffres.');
      return;
    }
    setError('');
    if (isDemoMode || !supabase) {
      navigate('/accueil');
      return;
    }
    setSending(true);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: `${country.code}${digits}` });
    setSending(false);
    if (err) setError("Le code n'a pas pu être envoyé. Réessaie dans un instant.");
    else navigate('/code', { state: { phone: `${country.code}${digits}` } });
  }

  return (
    <main className="page" style={{ padding: '28px 24px' }}>
      <Logo />
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontWeight: 700, color: 'var(--terracotta)' }}>Dalal ak jàmm</span>
        <h1 style={{ fontSize: 36, lineHeight: 1.05 }}>Achète et vends de tout, sans risque.</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45, color: 'var(--texte-2)' }}>
          Mode, téléphones, tenues de fête… Le marché d'occasion de chez nous, dans ta poche.
        </p>
      </div>

      <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        <label htmlFor="tel" className="field-label">Ton numéro de téléphone</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <label htmlFor="pays" className="sr-only">Indicatif du pays</label>
          <select id="pays" className="input" style={{ width: 110 }} value={countryIdx} onChange={(e) => setCountryIdx(Number(e.target.value))}>
            {countries.map((c, i) => <option key={c.code} value={i}>{c.code} {c.label}</option>)}
          </select>
          <input
            id="tel" className="input" type="tel" inputMode="tel" autoComplete="tel-national"
            placeholder={country.placeholder} value={phone} onChange={(e) => setPhone(e.target.value)}
            aria-invalid={error ? true : undefined} aria-describedby={error ? 'tel-err' : undefined}
          />
        </div>
        {error && <p id="tel-err" role="alert" style={{ margin: 0, color: 'var(--terracotta-dark)', fontWeight: 600 }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
          {sending ? 'Envoi…' : 'Recevoir mon code'}
        </button>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--texte-3)', textAlign: 'center' }}>
          Un code à 6 chiffres arrive par SMS. Pas d'e-mail, pas de mot de passe.
        </p>
      </form>

      <ul className="card" style={{ marginTop: 'auto', listStyle: 'none', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>
        <li><strong>Vends en 1 minute.</strong> Photo, prix, taille : c'est en ligne.</li>
        <li><strong>Garde 100 % de ton prix.</strong> Vendre est gratuit.</li>
        <li><strong>Achète sans risque.</strong> Ton argent est bloqué jusqu'à la réception.</li>
      </ul>
      {isDemoMode && <p style={{ margin: 0, fontSize: 12, color: 'var(--texte-3)', textAlign: 'center' }}>Mode démo {brand.name} : aucun SMS n'est envoyé.</p>}
    </main>
  );
}
