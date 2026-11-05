import { Link } from 'react-router-dom';
import { priceLabel } from '../config/brand';
import { conditionLabels, type Listing } from '../data/types';

export function ListingCard({ listing }: { listing: Listing }) {
  const meta = [listing.size, conditionLabels[listing.condition], listing.neighborhood].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/article/${listing.id}`}
      style={{ textDecoration: 'none', color: 'var(--encre)', background: 'var(--blanc)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div
        role="img"
        aria-label={`Photo : ${listing.title}`}
        style={{ height: 150, background: listing.photoColor }}
      />
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="price" style={{ fontSize: 17 }}>{priceLabel(listing.priceXof)}</span>
        <span style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</span>
        <span style={{ fontSize: 12, color: 'var(--texte-3)' }}>
          {listing.imeiVerified ? 'IMEI vérifié · ' : ''}{meta}
        </span>
      </div>
    </Link>
  );
}
