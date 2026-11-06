import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch } from '../components/Icons';
import { ListingCard } from '../components/ListingCard';
import { TabBar } from '../components/TabBar';
import { inCategory, useStore } from '../data/model';

export function Accueil() {
  const { listings, categories, me } = useStore();
  const [chosen, setChosen] = useState<string | null>(null);
  const cat = chosen ?? categories[0]?.id;
  const visible = listings.filter((l) => cat && inCategory(l, cat, categories));

  return (
    <>
      <main className="page">
        <h1 style={{ fontSize: 26 }}>Salut{me && me.id !== 'me' ? ` ${me.displayName}` : ''} !</h1>
        <Link to="/recherche" className="input" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--texte-3)' }}>
          <IconSearch size={20} /> Robe, iPhone, boubou…
        </Link>
        <div className="chips" role="group" aria-label="Catégories">
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={c.id === cat} onClick={() => setChosen(c.id)}>{c.label}</button>
          ))}
        </div>
        <section style={{ borderRadius: 18, background: 'var(--pirogue)', color: 'var(--blanc)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 19 }}>Vide ton armoire avant la fête</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#D5DFEC' }}>Vendre est gratuit. Tu gardes 100 %.</p>
          </div>
          <Link to="/publier" style={{ background: 'var(--soleil)', color: 'var(--encre)', borderRadius: 12, padding: '10px 14px', fontWeight: 700, textDecoration: 'none' }}>Jaay</Link>
        </section>
        <h2 style={{ fontSize: 19 }}>Près de chez toi</h2>
        <div className="grid-2">
          {visible.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
        {visible.length === 0 && <p style={{ margin: 0, color: 'var(--texte-2)' }}>Rien ici pour l'instant. Publie le premier article !</p>}
      </main>
      <TabBar />
    </>
  );
}
