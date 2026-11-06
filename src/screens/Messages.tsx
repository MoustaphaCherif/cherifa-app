import { Link } from 'react-router-dom';
import { TabBar } from '../components/TabBar';
import { formatXof } from '../config/brand';
import { useStore, type Message } from '../data/model';

function preview(m: Message | undefined): string {
  if (!m) return 'Nouvelle conversation';
  if (m.offerXof) {
    const who = m.from === 'me' ? 'Ton offre' : 'Offre';
    const st = m.offerStatus === 'acceptee' ? ' · acceptée' : m.offerStatus === 'refusee' ? ' · refusée' : '';
    return `${who} : ${formatXof(m.offerXof)}${st}`;
  }
  return m.body ?? '';
}

export function Messages() {
  const { conversations, listings } = useStore();

  return (
    <>
      <main className="page">
        <h1 style={{ fontSize: 26 }}>Messages</h1>
        {conversations.length === 0 && <p style={{ color: 'var(--texte-2)' }}>Pas encore de messages. Fais une offre sur un article pour commencer.</p>}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversations.map((c) => {
            const l = listings.find((x) => x.id === c.listingId);
            if (!l) return null;
            return (
              <li key={c.id}>
                <Link to={`/messages/${c.id}`} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', color: 'var(--encre)' }}>
                  <div aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, backgroundColor: l.photoColor, backgroundImage: l.photoUrl ? `url("${l.photoUrl}")` : undefined, backgroundSize: 'cover' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{c.otherName} · {l.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--texte-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview(c.messages.at(-1))}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <TabBar />
    </>
  );
}
