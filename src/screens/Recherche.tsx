import { useMemo, useState } from 'react';
import { ListingCard } from '../components/ListingCard';
import { TabBar } from '../components/TabBar';
import { categories } from '../data/demo';
import { useStore } from '../data/model';
import { conditionLabels, type ItemCondition } from '../data/types';

// Recherche sans accents ni majuscules : "telephone" trouve "Téléphone".
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const conditions: ItemCondition[] = ['neuf', 'tres_bon', 'bon'];

export function Recherche() {
  const { listings } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [cond, setCond] = useState<ItemCondition | null>(null);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const lo = parseInt(min, 10);
    const hi = parseInt(max, 10);
    return listings.filter((l) => {
      const text = norm(`${l.title} ${l.neighborhood} ${l.size ?? ''}`);
      if (!words.every((w) => text.includes(w))) return false;
      if (cat && l.categoryId !== cat) return false;
      if (cond && l.condition !== cond) return false;
      if (verifiedOnly && !l.seller.verified) return false;
      // Un article sans prix affiché ne correspond pas à un filtre de prix.
      if ((!isNaN(lo) || !isNaN(hi)) && l.priceXof <= 0) return false;
      if (!isNaN(lo) && l.priceXof < lo) return false;
      if (!isNaN(hi) && l.priceXof > hi) return false;
      return true;
    });
  }, [listings, q, cat, cond, min, max, verifiedOnly]);

  const toggle = <T,>(current: T | null, value: T, set: (v: T | null) => void) => set(current === value ? null : value);

  return (
    <>
      <main className="page">
        <h1 style={{ fontSize: 26 }}>Chercher</h1>
        <div className="field">
          <label htmlFor="q" className="sr-only">Que cherches-tu ?</label>
          <input id="q" type="search" className="input" placeholder="Robe, iPhone, boubou…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>Catégorie</legend>
          <div className="chips">
            {categories.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => toggle(cat, c.id, setCat)}>{c.label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>État</legend>
          <div className="chips">
            {conditions.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={cond === c} onClick={() => toggle(cond, c, setCond)}>{conditionLabels[c]}</button>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>Prix (FCFA)</legend>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label htmlFor="pmin" className="sr-only">Prix minimum</label>
            <input id="pmin" className="input" type="number" inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
            <span aria-hidden="true">à</span>
            <label htmlFor="pmax" className="sr-only">Prix maximum</label>
            <input id="pmax" className="input" type="number" inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </fieldset>

        <label className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, cursor: 'pointer' }}>
          Seulement les vendeurs vérifiés
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} style={{ width: 22, height: 22, accentColor: 'var(--pirogue)' }} />
        </label>

        <h2 style={{ fontSize: 19 }} aria-live="polite">
          {results.length === 0 ? 'Aucun article' : `${results.length} article${results.length > 1 ? 's' : ''}`}
        </h2>
        {results.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--texte-2)' }}>Essaie un autre mot ou enlève un filtre.</p>
        ) : (
          <div className="grid-2">{results.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
        )}
      </main>
      <TabBar />
    </>
  );
}
