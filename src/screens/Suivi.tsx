import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { formatXof } from '../config/brand';
import { ORDER_STEPS, useStore, type OrderStep } from '../data/model';

const stepText: Record<OrderStep, { title: string; sub: string }> = {
  payee: { title: 'Payé, argent bloqué', sub: 'Ton argent est gardé en sécurité' },
  recuperee: { title: "Récupéré chez le vendeur", sub: "Le livreur a l'article" },
  en_route: { title: 'En route vers toi', sub: "Le livreur t'appelle en arrivant" },
  livree: { title: 'Livré', sub: "Vérifie l'article, puis confirme" },
  confirmee: { title: 'Confirmé', sub: 'Le vendeur reçoit son argent' },
};

export function Suivi() {
  const { id } = useParams();
  const { orders, listings, advanceOrder, confirmOrder, reportProblem } = useStore();
  const order = orders.find((o) => o.id === id);
  const listing = listings.find((l) => l.id === order?.listingId);

  if (!order || !listing) {
    return <main className="page"><Header title="Commande introuvable" /><Link to="/armoire">Voir mes achats</Link></main>;
  }

  const current = ORDER_STEPS.indexOf(order.step);
  const done = order.step === 'confirmee';
  const canConfirm = order.step === 'livree' && !order.dispute;

  return (
    <>
      <main className="page">
        <Header title="Ta commande" subtitle={`${listing.title} · ${formatXof(order.itemPriceXof)}`} />

        <ol className="card" style={{ listStyle: 'none', margin: 0, padding: '16px 16px 4px' }}>
          {ORDER_STEPS.map((s, i) => {
            const isDone = i < current || (done && i === current);
            const isCurrent = i === current && !done;
            const last = i === ORDER_STEPS.length - 1;
            return (
              <li key={s} aria-current={isCurrent ? 'step' : undefined} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                  <span aria-hidden="true" style={{
                    width: 26, height: 26, borderRadius: 999, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? 'var(--pirogue)' : 'var(--blanc)', border: isCurrent ? '7px solid var(--terracotta)' : isDone ? 'none' : '2px solid #CFC3B1',
                    color: 'var(--blanc)', fontSize: 14, fontWeight: 800,
                  }}>{isDone ? '✓' : ''}</span>
                  <span aria-hidden="true" style={{ width: 2, flex: 1, minHeight: 22, background: last ? 'transparent' : i < current ? 'var(--pirogue)' : 'var(--bord)' }} />
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ fontWeight: isCurrent ? 800 : 700, color: isDone || isCurrent ? 'var(--encre)' : 'var(--texte-3)' }}>
                    {stepText[s].title}<span className="sr-only">{isDone ? ' (fait)' : isCurrent ? ' (en cours)' : ' (à venir)'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--texte-3)' }}>{stepText[s].sub}</div>
                </div>
              </li>
            );
          })}
        </ol>

        {order.dispute && (
          <div role="status" className="card" style={{ border: '2px solid var(--terracotta)' }}>
            <strong>Problème signalé.</strong> L'argent reste bloqué. Notre équipe te contacte pour régler le litige et te rembourser si l'article ne correspond pas.
          </div>
        )}

        {done ? (
          <div role="status" className="trust" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong>Merci ! La vente est terminée.</strong>
            <span>Le vendeur a reçu son argent. Tu pourras bientôt lui laisser un avis.</span>
          </div>
        ) : (
          order.mode === 'main_propre' || order.step !== 'payee' ? (
            <div style={{ background: 'var(--encre)', color: 'var(--blanc)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--soleil)' }}>Ton code de remise</span>
              <span className="price" style={{ fontSize: 40, letterSpacing: 12, paddingLeft: 12 }}>{order.handoverCode}</span>
              <span style={{ fontSize: 13, lineHeight: 1.4, color: '#E6DED2' }}>Vérifie l'article d'abord. Donne ce code seulement si tout est bon.</span>
            </div>
          ) : null
        )}

        {!done && !order.dispute && order.step !== 'livree' && (
          <button type="button" className="chip" style={{ alignSelf: 'center', border: '1px dashed var(--texte-3)' }} onClick={() => advanceOrder(order.id)}>
            Mode démo : simuler l'étape suivante
          </button>
        )}
      </main>

      {!done && (
        <div style={{ position: 'sticky', bottom: 0, background: 'var(--sable)', padding: '12px 18px 18px', display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: 15 }} onClick={() => reportProblem(order.id)} disabled={order.dispute}>Un problème ?</button>
          <button type="button" className="btn btn-primary" style={{ flex: 1.4, fontSize: 15 }} onClick={() => confirmOrder(order.id)} disabled={!canConfirm}>
            Tout est bon, je confirme
          </button>
        </div>
      )}
    </>
  );
}
