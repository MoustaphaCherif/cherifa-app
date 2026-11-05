import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconBack, IconShield, IconVerified } from '../components/Icons';
import { buyerProtectionFee, formatXof, priceLabel } from '../config/brand';
import { findListing } from '../data/demo';
import { conditionLabels } from '../data/types';

export function Article() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = findListing(id);

  if (!listing) {
    return (
      <main className="page">
        <h1 style={{ fontSize: 24 }}>Article introuvable</h1>
        <p>Il a peut-être déjà été vendu.</p>
        <Link to="/accueil" className="btn btn-primary">Retour à l'accueil</Link>
      </main>
    );
  }

  const hasPrice = listing.priceXof > 0;
  const fee = hasPrice ? buyerProtectionFee(listing.priceXof) : 0;

  return (
    <>
      <div role="img" aria-label={`Photo : ${listing.title}`} style={{ height: 320, background: listing.photoColor, position: 'relative' }}>
        <button type="button" onClick={() => navigate(-1)} aria-label="Retour"
          style={{ position: 'absolute', left: 16, top: 16, width: 44, height: 44, borderRadius: 999, border: 'none', background: 'var(--blanc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack />
        </button>
      </div>
      <main className="page">
        <div>
          <h1 style={{ fontFamily: 'var(--font-texte)', fontSize: 17, fontWeight: 600 }}>{listing.title}</h1>
          <p className="price" style={{ fontSize: 32, margin: '4px 0 8px' }}>{priceLabel(listing.priceXof)}</p>
          <div className="chips">
            {listing.size && <span className="chip" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center' }}>Taille {listing.size}</span>}
            <span className="chip" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center' }}>{conditionLabels[listing.condition]}</span>
            <span className="chip" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center' }}>{listing.neighborhood}</span>
            {listing.imeiVerified && <span className="chip" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center' }}>IMEI vérifié</span>}
          </div>
        </div>

        <div className="trust"><IconShield /><span><strong>Argent bloqué jusqu'à réception.</strong> Remboursé si l'article ne correspond pas.</span></div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--soleil)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {listing.seller.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {listing.seller.displayName}{listing.seller.verified && <IconVerified />}
            </div>
            <div style={{ fontSize: 13, color: 'var(--texte-3)' }}>{listing.seller.verified ? 'Vendeur vérifié' : 'Nouveau vendeur'} · {listing.seller.neighborhood}</div>
          </div>
        </div>

        {hasPrice && (
          <dl className="card" style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, fontSize: 14 }}>
            <dt style={{ color: 'var(--texte-2)' }}>Article</dt><dd style={{ margin: 0 }}>{formatXof(listing.priceXof)}</dd>
            <dt style={{ color: 'var(--texte-2)' }}>Protection acheteur</dt><dd style={{ margin: 0 }}>{formatXof(fee)}</dd>
            <dt style={{ color: 'var(--texte-2)' }}>Livraison</dt><dd style={{ margin: 0 }}>Choisie au paiement</dd>
          </dl>
        )}
      </main>
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--blanc)', borderTop: '1px solid #e9dfd0', padding: '12px 18px 18px', display: 'flex', gap: 10 }}>
        <Link to="/messages" className="btn btn-outline" style={{ flex: 1 }}>Faire une offre</Link>
        <button type="button" className="btn btn-primary" style={{ flex: 1.3 }} disabled={!hasPrice}>Acheter</button>
      </div>
    </>
  );
}
