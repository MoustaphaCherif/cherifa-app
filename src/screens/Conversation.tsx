import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { IconShield, IconVerified } from '../components/Icons';
import { formatXof, priceLabel } from '../config/brand';
import { useStore, type Message } from '../data/model';

function Bubble({ m, listingId }: { m: Message; listingId: string }) {
  const mine = m.from === 'me';
  if (m.offerXof) {
    return (
      <div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', width: '78%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="card" style={{ border: '2px solid var(--terracotta)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{mine ? 'Ton offre' : 'Offre reçue'}</div>
          <div className="price" style={{ fontSize: 22 }}>{formatXof(m.offerXof)}</div>
          <div style={{ fontSize: 13, color: 'var(--texte-3)' }}>
            {m.offerStatus === 'proposee' ? 'En attente de réponse' : m.offerStatus === 'acceptee' ? 'Acceptée' : 'Refusée'}
          </div>
        </div>
        {m.offerStatus === 'acceptee' && mine && (
          <div className="trust" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <strong>Offre acceptée à {formatXof(m.offerXof)}</strong>
            <Link to={`/paiement/${listingId}?prix=${m.offerXof}`} className="btn" style={{ height: 46, background: 'var(--soleil)', color: 'var(--encre)' }}>Payer maintenant</Link>
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{
      alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%', padding: '10px 14px', fontSize: 15, lineHeight: 1.4,
      borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: mine ? 'var(--terracotta)' : 'var(--blanc)', color: mine ? 'var(--blanc)' : 'var(--encre)',
    }}>{m.body}</div>
  );
}

export function Conversation() {
  const { id } = useParams();
  const { conversations, listings, sendMessage, sendOffer, simulateSellerReply } = useStore();
  const conv = conversations.find((c) => c.id === id);
  const listing = listings.find((l) => l.id === conv?.listingId);
  const [text, setText] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState('');
  const [offerError, setOfferError] = useState('');

  if (!conv || !listing) {
    return <main className="page"><Header title="Conversation introuvable" /><Link to="/messages">Retour aux messages</Link></main>;
  }

  const pending = conv.messages.some((m) => m.offerStatus === 'proposee');

  function submitText(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(conv!.id, text.trim());
    setText('');
  }

  function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(offer, 10);
    if (!(n >= 100)) return setOfferError('Indique un montant (100 F minimum).');
    if (listing!.priceXof > 0 && n >= listing!.priceXof) return setOfferError(`Ton offre doit être inférieure au prix (${formatXof(listing!.priceXof)}).`);
    sendOffer(conv!.id, n);
    setOffer('');
    setOfferError('');
    setOfferOpen(false);
  }

  return (
    <>
      <div style={{ background: 'var(--blanc)', borderBottom: '1px solid #e9dfd0', padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Header title={listing.seller.displayName} subtitle={listing.seller.verified ? 'Vendeur vérifié' : 'Nouveau vendeur'} />
        <Link to={`/article/${listing.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sable)', borderRadius: 12, padding: 8, textDecoration: 'none', color: 'var(--encre)' }}>
          <span style={{ flex: 1 }}>{listing.title}{listing.seller.verified && <> <IconVerified size={14} /></>}</span>
          <span className="price">{priceLabel(listing.priceXof)}</span>
        </Link>
      </div>

      <main className="page" style={{ gap: 10 }}>
        {conv.messages.length === 0 && <p style={{ color: 'var(--texte-3)', textAlign: 'center' }}>Pose ta question ou fais une offre.</p>}
        {conv.messages.map((m) => <Bubble key={m.id} m={m} listingId={listing.id} />)}

        {pending && (
          <div className="card" style={{ border: '1px dashed var(--texte-3)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--texte-2)' }}>Mode démo : simuler la réponse du vendeur</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="chip" onClick={() => simulateSellerReply(conv.id, true)}>Il accepte</button>
              <button type="button" className="chip" onClick={() => simulateSellerReply(conv.id, false)}>Il refuse</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', background: '#FDF1DD', borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, color: '#4A3410', display: 'flex', gap: 8 }}>
          <IconShield size={18} color="#9A6412" />
          <span>Paie toujours dans l'app : ton argent n'est protégé que s'il passe par nous.</span>
        </div>
      </main>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--blanc)', borderTop: '1px solid #e9dfd0', padding: '10px 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {offerOpen ? (
          <form onSubmit={submitOffer} style={{ display: 'flex', flexDirection: 'column', gap: 6 }} noValidate>
            <label htmlFor="offre" className="field-label">Ton offre (FCFA)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="offre" className="input" type="number" inputMode="numeric" value={offer} onChange={(e) => setOffer(e.target.value)} autoFocus
                aria-invalid={offerError ? true : undefined} aria-describedby={offerError ? 'offre-err' : undefined} />
              <button type="submit" className="btn btn-primary" style={{ height: 50 }}>Envoyer</button>
            </div>
            {offerError && <span id="offre-err" role="alert" style={{ color: 'var(--terracotta-dark)', fontWeight: 600, fontSize: 14 }}>{offerError}</span>}
            <button type="button" className="chip" style={{ alignSelf: 'flex-start' }} onClick={() => setOfferOpen(false)}>Annuler</button>
          </form>
        ) : (
          <form onSubmit={submitText} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn btn-outline" style={{ height: 46, padding: '0 14px', fontSize: 14 }} onClick={() => setOfferOpen(true)} disabled={pending}>Offre</button>
            <label htmlFor="msg" className="sr-only">Message</label>
            <input id="msg" className="input" style={{ height: 46, background: 'var(--sable)' }} placeholder="Écris un message…" value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ height: 46, padding: '0 14px', fontSize: 14 }}>Envoyer</button>
          </form>
        )}
      </div>
    </>
  );
}
