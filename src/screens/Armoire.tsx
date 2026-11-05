import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import { TabBar } from '../components/TabBar';
import { formatXof } from '../config/brand';
import { ME, useStore } from '../data/model';

type Tab = 'vente' | 'achats';

export function Armoire() {
  const { listings, orders } = useStore();
  const [tab, setTab] = useState<Tab>('vente');
  const mine = listings.filter((l) => l.seller.id === ME.id);

  return (
    <>
      <main className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--terracotta)', color: 'var(--blanc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>M</div>
          <div>
            <h1 style={{ fontSize: 24 }}>Sama armoire</h1>
            <p style={{ margin: 0, color: 'var(--texte-2)', fontSize: 14 }}>{ME.neighborhood}</p>
          </div>
        </div>

        <section className="trust" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10, padding: 16, borderRadius: 18 }}>
          <span style={{ fontSize: 13, color: '#D5DFEC' }}>Mon argent disponible</span>
          <span className="price" style={{ fontSize: 30 }}>{formatXof(0)}</span>
          <span style={{ fontSize: 13, color: '#D5DFEC' }}>Tu touches 100 % de tes ventes dès que l'acheteur confirme la réception.</span>
        </section>

        <div role="tablist" aria-label="Mes articles" className="card" style={{ display: 'flex', padding: 4, gap: 4 }}>
          {([['vente', `En vente (${mine.length})`], ['achats', `Mes achats (${orders.length})`]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: tab === id ? 'var(--encre)' : 'transparent', color: tab === id ? 'var(--blanc)' : 'var(--texte-2)' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'vente' && (mine.length === 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span>Tu ne vends rien pour l'instant. Une minute suffit pour publier.</span>
            <Link to="/publier" className="btn btn-primary">Vendre un article</Link>
          </div>
        ) : (
          <div className="grid-2">{mine.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
        ))}

        {tab === 'achats' && (orders.length === 0 ? (
          <p className="card" style={{ margin: 0 }}>Pas encore d'achat.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map((o) => {
              const l = listings.find((x) => x.id === o.listingId);
              return (
                <li key={o.id}>
                  <Link to={`/commande/${o.id}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--encre)' }}>
                    <span>{l?.title ?? 'Article'}</span>
                    <span style={{ fontWeight: 700 }}>{o.dispute ? 'Litige' : o.step === 'confirmee' ? 'Terminé' : 'En cours'}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </main>
      <TabBar />
    </>
  );
}
