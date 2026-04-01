# 🔗 Link-in-Bio Tracker

Un **link-in-bio intelligent** qui collecte silencieusement des données sur chaque visiteur, filtre les bots via Cloudflare Turnstile, et offre un dashboard admin complet.

## ✨ Fonctionnalités

- 🕵️ **Tracking automatique** : IP (tronquée CNIL), User-Agent, referer, géolocalisation
- 🛡️ **Captcha Cloudflare Turnstile** : gratuit, invisible ou interactif
- 🍪 **Cookie de retour** : identifie les visiteurs qui reviennent
- 📊 **Dashboard admin** : tableau de visites, stats, sources de trafic
- 🔒 **Conformité RGPD/CNIL** : IP tronquée à 3 octets
- ⚡ **100% gratuit** sur Vercel + Cloudflare

## 🚀 Déploiement

### 1. Préparer Cloudflare Turnstile (GRATUIT)

1. Créer un compte sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Aller dans **Zero Trust → Turnstile → Add Site**
3. Choisir le type de widget (`Managed` recommandé)
4. Copier la **Site Key** (publique) et la **Secret Key**

### 2. Déployer sur Vercel

```bash
# Cloner le projet
git clone <votre-repo>
cd link-in-bio

# Push sur GitHub
git init && git add . && git commit -m "init"
git remote add origin https://github.com/vous/link-in-bio.git
git push -u origin main
```

1. Aller sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importer votre repo GitHub
3. Dans **Storage** → **Create KV Database** → connecter au projet
   - Vercel injecte automatiquement `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`

### 3. Variables d'environnement Vercel

Dans **Settings → Environment Variables**, ajouter :

| Variable | Valeur |
|---|---|
| `TURNSTILE_SECRET_KEY` | Votre clé secrète Cloudflare |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Votre clé publique Cloudflare |
| `NEXT_PUBLIC_REDIRECT_URL` | URL finale (ex: `https://linktr.ee/vous`) |
| `ADMIN_KEY` | Mot de passe dashboard (ex: `M0nM0t2P@sse!`) |
| `NEXT_PUBLIC_ADMIN_KEY` | Idem (même valeur) |

### 4. Accès au dashboard

```
https://votre-site.vercel.app/admin?key=VOTRE_ADMIN_KEY
```

## 🗂️ Structure

```
app/
├── page.tsx                   → Page publique (captcha)
├── admin/page.tsx             → Dashboard admin
├── api/
│   ├── visit/route.ts         → Collecte des données visiteur
│   ├── verify-captcha/route.ts → Vérification Turnstile
│   └── admin/visits/route.ts  → API logs (GET + DELETE)
lib/
├── kv.ts                      → Helpers Vercel KV
└── geo.ts                     → Géolocalisation IP
```

## 🔒 RGPD / CNIL

- Les IPs sont **tronquées à 3 octets** avant stockage (`192.168.1.xxx`)
- Mention légale affichée en bas de la page captcha
- Pas de tracking third-party (pas de GA, pas de Pixel)
- Le dashboard n'est pas indexé par les moteurs de recherche

## 💻 Développement local

```bash
npm install
cp .env.local.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

> **Note** : Sans Vercel KV en local, le stockage ne fonctionnera pas.  
> Utilisez [Vercel CLI](https://vercel.com/docs/cli) avec `vercel env pull` pour récupérer les vraies variables KV.

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
npm run dev
```
