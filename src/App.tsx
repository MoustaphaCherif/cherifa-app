import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './data/model';
import { Accueil } from './screens/Accueil';
import { Armoire } from './screens/Armoire';
import { Article } from './screens/Article';
import { Bienvenue } from './screens/Bienvenue';
import { Code } from './screens/Code';
import { Conversation } from './screens/Conversation';
import { Messages } from './screens/Messages';
import { Paiement } from './screens/Paiement';
import { Profil } from './screens/Profil';
import { Publier } from './screens/Publier';
import { Recherche } from './screens/Recherche';
import { Suivi } from './screens/Suivi';

// Pages réservées aux personnes connectées (en mode démo, tout est ouvert).
function Connecte({ children }: { children: ReactNode }) {
  const { auth } = useStore();
  if (auth === 'chargement') return <main className="page" aria-busy="true"><p style={{ color: 'var(--texte-3)' }}>Chargement…</p></main>;
  if (auth === 'deconnecte') return <Navigate to="/" replace />;
  if (auth === 'sans_profil') return <Navigate to="/profil" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenue />} />
        <Route path="/code" element={<Code />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/publier" element={<Connecte><Publier /></Connecte>} />
        <Route path="/messages" element={<Connecte><Messages /></Connecte>} />
        <Route path="/messages/:id" element={<Connecte><Conversation /></Connecte>} />
        <Route path="/paiement/:id" element={<Connecte><Paiement /></Connecte>} />
        <Route path="/commande/:id" element={<Connecte><Suivi /></Connecte>} />
        <Route path="/armoire" element={<Connecte><Armoire /></Connecte>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
