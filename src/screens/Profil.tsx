// Première connexion : prénom et quartier, affichés sur les annonces.
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { errorText, useStore } from '../data/model';

export function Profil() {
  const navigate = useNavigate();
  const { auth, createProfile } = useStore();
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth === 'connecte' || auth === 'demo') return <Navigate to="/accueil" replace />;
  if (auth === 'deconnecte') return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2 || n.length > 40) return setError('Ton prénom doit faire entre 2 et 40 lettres.');
    setBusy(true);
    try {
      await createProfile(n, neighborhood.trim() || 'Dakar');
      navigate('/accueil', { replace: true });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <main className="page" style={{ padding: '28px 24px' }}>
      <Header title="Bienvenue !" subtitle="Dernière étape, promis." />
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
        <div className="field">
          <label htmlFor="prenom">Ton prénom (ou un surnom)</label>
          <input id="prenom" className="input" autoComplete="given-name" maxLength={40} value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Ex. Fatou D." />
        </div>
        <div className="field">
          <label htmlFor="quartier">Ton quartier</label>
          <input id="quartier" className="input" maxLength={60} value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex. Mermoz, Ouakam, Parcelles…" aria-describedby="quartier-aide" />
          <span id="quartier-aide" style={{ fontSize: 13, color: 'var(--texte-3)' }}>Affiché sur tes annonces pour les acheteurs proches.</span>
        </div>
        {error && <p role="alert" style={{ margin: 0, color: 'var(--terracotta-dark)', fontWeight: 600 }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy || auth === 'chargement'}>{busy ? 'Enregistrement…' : "C'est parti"}</button>
      </form>
    </main>
  );
}
