import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { IconShield } from '../components/Icons';
import { buyerProtectionFee, DELIVERY_FEE_DAKAR_XOF, formatXof } from '../config/brand';
import { ME, useStore, type DeliveryMode, type Provider } from '../data/model';

const providers: { id: Provider; label: string; short: string; bg: string }[] = [
  { id: 'wave', label: 'Wave', short: 'W', bg: '#1DC8F2' },
  { id: 'orange_money', label: 'Orange Money', short: 'OM', bg: '#FF7900' },
];

export function Paiement() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { listings, conversations, orders, createOrder } = useStore();
  const listing = listings.find((l) => l.id === id);

  const [mode, setMode] = useState<DeliveryMode>('moto');
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState<Provider>('wave');
  const [error, setError] = useState('');

  if (!listing || listing.priceXof <= 0 || listing.seller.id === ME.id) {
    return <main className="page"><Header title="Paiement impossible" /><p>Cet article n'est pas disponible à l'achat.</p><Link to="/accueil">Retour à l'accueil</Link></main>;
  }
  if (orders.some((o) => o.listingId === listing.id)) {
    return <main className="page"><Header title="Déjà commandé" /><p>Tu as déjà une commande en cours pour cet article.</p><Link to="/armoire" className="btn btn-primary">Voir mes achats</Link></main>;
  }

  // Le prix d'une offre n'est appliqué que si cette offre a vraiment été acceptée.
  // En production, c'est le SERVEUR qui refait cette vérification : un prix venant de l'URL n'est jamais cru.
  const asked = parseInt(params.get('prix') ?? '', 10);
  const acceptedOffer = conversations
    .filter((c) => c.listingId === listing.id)
    .flatMap((c) => c.messages)
    .some((m) => m.offerStatus === 'acceptee' && m.offerXof === asked);
  const itemPrice = acceptedOffer ? asked : listing.priceXof;
  const fee = buyerProtectionFee(itemPrice);
  const delivery = mode === 'moto' ? DELIVERY_FEE_DAKAR_XOF : 0;
  const total = delivery === null ? null : itemPrice + fee + delivery;

  function pay() {
    if (mode === 'moto' && address.trim().length < 5) {
      setError('Indique ton quartier et un point de repère pour le livreur.');
      return;
    }
    // Production : appel d'une Edge Function qui crée la session de paiement
    // Wave / Orange Money, puis redirection vers leur page. La commande ne passe
    // à « payée » qu'à la réception du webhook de confirmation.
    const orderId = createOrder({
      listingId: listing!.id,
      itemPriceXof: itemPrice,
      deliveryFeeXof: delivery,
      mode,
      address: mode === 'moto' ? address.trim() : undefined,
      provider,
    });
    navigate(`/commande/${orderId}`, { replace: true });
  }

  const card = (on: boolean) => ({
    flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start', gap: 2, padding: 12, borderRadius: 14,
    background: 'var(--blanc)', border: on ? '2px solid var(--terracotta)' : '1px solid var(--bord)', textAlign: 'left' as const, cursor: 'pointer',
  });

  return (
    <>
      <main className="page">
        <Header title="Paiement" subtitle={listing.title} />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>Comment tu le reçois ?</legend>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" aria-pressed={mode === 'moto'} style={card(mode === 'moto')} onClick={() => setMode('moto')}>
              <strong>Livraison moto</strong><span style={{ fontSize: 12, color: 'var(--texte-2)' }}>Chez toi, à Dakar</span>
            </button>
            <button type="button" aria-pressed={mode === 'main_propre'} style={card(mode === 'main_propre')} onClick={() => setMode('main_propre')}>
              <strong>En main propre</strong><span style={{ fontSize: 12, color: 'var(--texte-2)' }}>Lieu public, code à 4 chiffres</span>
            </button>
          </div>
        </fieldset>

        {mode === 'moto' && (
          <div className="field">
            <label htmlFor="adresse">Où on te livre ?</label>
            <input id="adresse" className="input" placeholder="Ex. Sacré-Cœur 3, près de la boulangerie" value={address} onChange={(e) => { setAddress(e.target.value); setError(''); }}
              aria-invalid={error ? true : undefined} aria-describedby="adresse-aide" />
            <span id="adresse-aide" style={{ fontSize: 12, color: 'var(--texte-3)' }}>Quartier et point de repère : le livreur t'appelle en arrivant.</span>
          </div>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>Payer avec</legend>
          {providers.map((p) => (
            <label key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: provider === p.id ? '2px solid var(--pirogue)' : '1px solid var(--bord)' }}>
              <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, background: p.bg, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.short}</span>
              <span style={{ flex: 1, fontWeight: 700 }}>{p.label}</span>
              <input type="radio" name="provider" checked={provider === p.id} onChange={() => setProvider(p.id)} style={{ width: 22, height: 22, accentColor: 'var(--pirogue)' }} />
            </label>
          ))}
        </fieldset>

        <dl className="card" style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, fontSize: 14 }}>
          <dt style={{ color: 'var(--texte-2)' }}>Article{acceptedOffer ? ' (offre acceptée)' : ''}</dt><dd style={{ margin: 0 }}>{formatXof(itemPrice)}</dd>
          <dt style={{ color: 'var(--texte-2)' }}>Protection acheteur</dt><dd style={{ margin: 0 }}>{formatXof(fee)}</dd>
          <dt style={{ color: 'var(--texte-2)' }}>{mode === 'moto' ? 'Livraison moto' : 'Remise en main propre'}</dt>
          <dd style={{ margin: 0 }}>{delivery === null ? 'À confirmer' : formatXof(delivery)}</dd>
          <dt style={{ fontWeight: 800, fontSize: 16, borderTop: '1px solid #efe6d8', paddingTop: 6 }}>Total</dt>
          <dd style={{ margin: 0, fontWeight: 800, fontSize: 16, borderTop: '1px solid #efe6d8', paddingTop: 6 }}>{total === null ? `${formatXof(itemPrice + fee)} + livraison` : formatXof(total)}</dd>
        </dl>

        {error && <p role="alert" style={{ margin: 0, color: 'var(--terracotta-dark)', fontWeight: 600 }}>{error}</p>}
      </main>
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--sable)', padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--pirogue)', fontWeight: 600 }}>
          <IconShield size={18} color="#14396B" />Le vendeur est payé seulement quand tu confirmes la réception.
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={pay}>
          Payer avec {provider === 'wave' ? 'Wave' : 'Orange Money'}
        </button>
      </div>
    </>
  );
}
