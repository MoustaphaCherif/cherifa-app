// Test de bout en bout du mode démo. Lancer : npm run build && npx vite preview --port 4173,
// puis : node tests/parcours.e2e.mjs <dossier contenant photo.png, où les captures seront écrites>
// (nécessite : npm i -D playwright && npx playwright install chromium)
import { chromium } from 'playwright';
const out = process.argv[2]; const U = 'http://localhost:4173';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.setDefaultTimeout(5000);
const errs = []; p.on('pageerror', e => errs.push(e.message));
const ok = (name, cond) => console.log((cond ? 'OK   ' : 'ECHEC') + ' ' + name);
const shot = (n) => p.screenshot({ path: `${out}/${n}.png`, fullPage: true });
try {
  // 1. Recherche
  await p.goto(U + '/recherche'); await p.fill('#q', 'iphone'); await p.waitForTimeout(200);
  ok('Recherche "iphone" trouve 1 article', (await p.locator('main a[href^="/article/"]').count()) === 1);
  await p.fill('#q', ''); await p.fill('#pmax', '5000'); await p.waitForTimeout(200);
  ok('Filtre prix max 5000 : 2 articles', (await p.locator('main a[href^="/article/"]').count()) === 2);
  await shot('e2e-recherche');
  // 2. Offre (navigation dans l'app pour garder l'état)
  await p.goto(U + '/accueil'); await p.click('a[href="/article/l2"]');
  await p.click('button:has-text("Faire une offre")'); await p.waitForURL(/\/messages\//);
  await p.click('button:text-is("Offre")'); await p.fill('#offre', '15000'); await p.click('form button[type=submit]');
  ok('Offre supérieure au prix refusée', await p.locator('#offre-err').isVisible());
  await p.fill('#offre', '10000'); await p.click('form button[type=submit]');
  await p.click('text=Il accepte'); await shot('e2e-conversation');
  ok('Bouton Payer après acceptation', await p.locator('text=Payer maintenant').isVisible());
  await p.click('text=Payer maintenant'); await p.waitForURL(/\/paiement\//);
  ok("Prix de l'offre appliqué (10 000 F)", (await p.textContent('dl')).replace(/\s/gu, ' ').includes('10 000 F'));
  // 3. Prix truqué dans l'URL
  await p.evaluate(() => { history.pushState({}, '', '/paiement/l2?prix=100'); dispatchEvent(new PopStateEvent('popstate')); });
  await p.waitForTimeout(300);
  ok('Prix truqué ?prix=100 ignoré (12 500 F)', (await p.textContent('dl')).replace(/\s/gu, ' ').includes('12 500 F'));
  await p.goBack(); await p.waitForTimeout(300);
  await p.click('button:has-text("Payer avec")');
  ok('Adresse exigée pour la livraison moto', await p.locator('[role=alert]').isVisible());
  await p.fill('#adresse', 'Ouakam, près de la mosquée'); await shot('e2e-paiement');
  await p.click('button:has-text("Payer avec")'); await p.waitForURL(/\/commande\//);
  ok('Confirmer impossible avant livraison', await p.locator('button:has-text("je confirme")').isDisabled());
  for (let i = 0; i < 3; i++) await p.click('button:has-text("simuler")');
  await shot('e2e-suivi-livre');
  await p.click('button:has-text("je confirme")');
  ok('Commande confirmée', await p.locator('text=La vente est terminée').isVisible());
  // 4. Publier avec photo
  await p.click('button[aria-label="Retour"]'); await p.waitForTimeout(200);
  await p.evaluate(() => { history.pushState({}, '', '/publier'); dispatchEvent(new PopStateEvent('popstate')); });
  await p.waitForTimeout(300);
  await p.setInputFiles('#photos', `${out}/photo.png`);
  await p.fill('#titre', 'Pagne tissé'); await p.fill('#prix', '7000'); await p.click('button:has-text("Très bon état")');
  await p.click('button:has-text("Publier mon article")');
  ok('Publication réussie', await p.locator("text=C'est en ligne").isVisible());
  await p.click('text=Voir mon annonce'); await p.waitForTimeout(300); await shot('e2e-mon-annonce');
  ok('Pas de bouton Acheter sur son propre article', (await p.locator('a:has-text("Acheter")').count()) === 0);
  await p.click('text=voir mon armoire'); await p.waitForTimeout(300); await shot('e2e-armoire');
  ok("Article visible dans l'armoire", await p.locator('text=Pagne tissé').isVisible());
  await p.click('role=tab[name=/Mes achats/]');
  ok("Achat visible et terminé dans l'armoire", await p.locator('text=Terminé').isVisible());
} catch (e) { console.log('ARRET :', e.message.split('\n')[0]); await shot('e2e-erreur'); }
console.log('Erreurs JS :', JSON.stringify(errs)); await b.close();
