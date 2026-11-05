import type { Listing } from '../data/types';

export function Photo({ listing, height }: { listing: Listing; height: number }) {
  return (
    <div
      role="img"
      aria-label={`Photo : ${listing.title}`}
      style={{
        height,
        backgroundColor: listing.photoColor,
        backgroundImage: listing.photoUrl ? `url("${listing.photoUrl}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
