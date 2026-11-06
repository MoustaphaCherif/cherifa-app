// Saisie du code reçu par SMS (après l'écran Bienvenue).
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

export function Code() {
  const navigate = useNavigate();
  const phone = (useLocation().state as { phone?: string } | null)?.phone;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  if (!phone || !supabase) return <Navigate to="/" replace />;

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError('Le code fait 6 chiffres.');
    setBusy(true);
    const { error: err } = await supabase!.auth.verifyOtp({ phone: phone!, token: code, type: 'sms' });
    setBusy(false);
    if (err) return setError('Code incorrect ou expiré. Vérifie le SMS ou demande un nouveau code.');
    // Le store détecte la session ; la garde des pages renvoie vers /profil si besoin.
    navigate('/accueil', { replace: true });
  }

  async function resend() {
    setError('');
    const { error: err } = await supabase!.auth.signInWithOtp({ phone: phone! });
    if (err) setError("Le code n'a pas pu être renvoyé. Attends une minute et réessaie.");
    else setResent(true);
  }

  return (
    <main className="page" style={{ padding: '28px 24px' }}>
      <Header title="Ton code" subtitle={`Envoyé par SMS au ${phone}`} />
      <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 10 }} noValidate>
        <label htmlFor="code" className="field-label">Code à 6 chiffres</label>
        <input id="code" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
          style={{ fontSize: 28, letterSpacing: 10, textAlign: 'center' }}
          value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'code-err' : undefined} />
        {error && <p id="code-err" role="alert" style={{ margin: 0, color: 'var(--terracotta-dark)', fontWeight: 600 }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Vérification…' : 'Valider'}</button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {resent ? <p role="status" style={{ margin: 0, color: 'var(--texte-2)' }}>Nouveau code envoyé.</p>
          : <button type="button" className="chip" onClick={resend}>Je n'ai rien reçu : renvoyer le code</button>}
        <Link to="/" style={{ color: 'var(--texte-2)' }}>Changer de numéro</Link>
      </div>
    </main>
  );
}
