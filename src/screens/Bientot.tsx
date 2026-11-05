import { TabBar } from '../components/TabBar';

// Écrans prévus au plan (recherche, messagerie, paiement, suivi, armoire),
// à coder dans les prochaines étapes à partir des maquettes.
export function Bientot({ titre }: { titre: string }) {
  return (
    <>
      <main className="page">
        <h1 style={{ fontSize: 26 }}>{titre}</h1>
        <p style={{ color: 'var(--texte-2)' }}>Cet écran arrive bientôt.</p>
      </main>
      <TabBar />
    </>
  );
}
