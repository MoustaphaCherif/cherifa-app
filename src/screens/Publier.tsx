import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorText, useStore } from '../data/model';
import { formatXof } from '../config/brand';
import { conditionLabels, type ItemCondition } from '../data/types';

const sizes = ['S', 'M', 'L', 'XL', 'Sur mesure'];
const conditions: ItemCondition[] = ['neuf', 'tres_bon', 'bon'];

export function Publier() {
  const { addListing, categories } = useStore();
  const [newId, setNewId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [chosenCategory, setCategoryId] = useState<string | null>(null);
  const categoryId = chosenCategory ?? categories[0]?.id ?? '';
  const [size, setSize] = useState<string | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [imei, setImei] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const category = categories.find((c) => c.id === categoryId);
  const priceNum = parseInt(price, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (photos.length === 0) errs.push('Ajoute au moins une photo.');
    if (title.trim().length < 3) errs.push('Dis en quelques mots ce que tu vends.');
    if (!(priceNum >= 100)) errs.push('Indique un prix (100 F minimum).');
    if (!condition) errs.push("Choisis l'état de l'article.");
    if (!category) errs.push('Choisis une catégorie.');
    if (category?.requiresImei && !/^\d{15}$/.test(imei)) errs.push("Le numéro IMEI doit faire 15 chiffres (tape *#06# sur le téléphone).");
    setErrors(errs);
    if (errs.length > 0) return;
    // Mode démo : enregistré en mémoire. Avec Supabase : photos compressées, envoyées, puis annonce en ligne.
    setBusy(true);
    try {
      const id = await addListing({
        title: title.trim(),
        priceXof: priceNum,
        categoryId,
        size: category!.requiresImei ? undefined : size ?? undefined,
        condition: condition!,
        imei: category!.requiresImei ? imei : undefined, // vérifié ensuite côté serveur
        photos,
      });
      setNewId(id);
      setDone(true);
    } catch (err) {
      setErrors([errorText(err)]);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="page" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: 30 }}>C'est en ligne !</h1>
        <p style={{ fontSize: 17, color: 'var(--texte-2)' }}>« {title} » à {formatXof(priceNum)}. Tu recevras un message à chaque offre.</p>
        {newId && <Link to={`/article/${newId}`} className="btn btn-primary">Voir mon annonce</Link>}
        <Link to="/accueil" className="btn btn-outline">Retour à l'accueil</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Jaay</h1>
          <p style={{ margin: 0, color: 'var(--texte-3)' }}>Vends en 1 minute. C'est gratuit.</p>
        </div>
        <Link to="/accueil" aria-label="Fermer" className="chip" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--encre)' }}>✕</Link>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <div className="field">
          <input id="photos" className="sr-only" type="file" accept="image/*" multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))} />
          <label htmlFor="photos"
            style={{ minHeight: 110, borderRadius: 16, border: '2px dashed var(--terracotta)', background: 'var(--terracotta-tint)', color: 'var(--terracotta)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{photos.length ? 'Changer les photos' : 'Ajouter des photos'}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{photos.length}/5 · 4 photos conseillées</span>
          </label>
        </div>
        <div className="field">
          <label htmlFor="titre">Qu'est-ce que tu vends ?</label>
          <input id="titre" className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Robe wax longue" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="prix">Ton prix (FCFA)</label>
            <input id="prix" className="input" type="number" inputMode="numeric" min={100} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="cat">Catégorie</label>
            <select id="cat" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--pirogue-tint)', color: 'var(--pirogue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Tu reçois, sans commission</span>
          <span className="price" style={{ fontSize: 20 }}>{priceNum > 0 ? formatXof(priceNum) : '—'}</span>
        </div>

        {category?.requiresImei ? (
          <div className="field">
            <label htmlFor="imei">Numéro IMEI</label>
            <input id="imei" className="input" inputMode="numeric" maxLength={15} value={imei} onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))} aria-describedby="imei-aide" />
            <span id="imei-aide" style={{ fontSize: 13, color: 'var(--texte-3)' }}>Tape *#06# sur le téléphone. On vérifie qu'il n'est pas déclaré volé.</span>
          </div>
        ) : (
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="field-label" style={{ marginBottom: 8 }}>Taille</legend>
            <div className="chips">
              {sizes.map((s) => <button key={s} type="button" className="chip" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</button>)}
            </div>
          </fieldset>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ marginBottom: 8 }}>État</legend>
          <div className="chips">
            {conditions.map((c) => <button key={c} type="button" className="chip" aria-pressed={condition === c} onClick={() => setCondition(c)}>{conditionLabels[c]}</button>)}
          </div>
        </fieldset>

        {errors.length > 0 && (
          <ul role="alert" style={{ margin: 0, paddingLeft: 18, color: 'var(--terracotta-dark)', fontWeight: 600 }}>
            {errors.map((er) => <li key={er}>{er}</li>)}
          </ul>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Envoi des photos…' : 'Publier mon article'}</button>
      </form>
    </main>
  );
}
