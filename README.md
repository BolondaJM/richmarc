# Richmarc Homes website

A luxury home build and sales site in plain HTML, CSS and JavaScript (no build step), hosted on **Cloudflare Pages**. A small Cloudflare Pages Function powers the admin panel.

## Deploy on Cloudflare Pages

1. **Connect the repo:** in the Cloudflare dashboard go to **Workers & Pages → Create → Pages → Connect to Git**, pick this repository and use:
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
2. **Create the storage:** **Workers & Pages → KV → Create a namespace**, name it e.g. `richmarc-content`.
3. **Bind it to the site:** open the Pages project → **Settings → Bindings → Add → KV namespace**. Set **Variable name** to `RICHMARC_KV` (exactly) and pick the namespace you created. Add it for Production (and Preview if you use preview deployments).
4. **Redeploy:** **Deployments → … on the latest deployment → Retry deployment** so the binding takes effect.
5. Open `https://<your-project>.pages.dev/admin/` and sign in with **admin / admin**. Then change that password right away (Account), or better: add your own admin user under **Users** and delete `admin`.

Every push to `main` redeploys the site automatically. Content edited in the admin does **not** need a redeploy.

## Run it locally

```bash
npx wrangler@4.159.0 pages dev . --kv RICHMARC_KV --port 5173
```

Then open http://localhost:5173 (admin at http://localhost:5173/admin/). This runs the same Pages Functions as production, with a local KV store kept in `.wrangler/` (git-ignored, starts again from admin / admin). Requires Node.js. There is deliberately no `package.json`: Cloudflare would otherwise install `node_modules` into the deployed site.

## Admin panel

From `/admin/` you can add, edit, reorder, duplicate and delete:

- Homes (all fields, cover photo, gallery, features; photos can be uploaded)
- Testimonials, FAQs and home page stats
- Custom build estimator tiers and extras
- Site settings: email, phone, studio address, hours, footer text, social links

Edits stay in the browser until you click **Publish changes** (or Ctrl+S). Publishing saves the content to KV and `/js/content.js` serves it straight away. (Cloudflare KV can take up to a minute to reach every region.) Each publish keeps the previous version as a 30 day backup in KV, and **Download backup** saves the current content as a JSON file.

### Users and roles

- **Admin:** edits content and manages users.
- **Editor:** edits content only.

Admins see a **Users** page to add users, switch a user between admin and editor, set a new password for someone, and delete users. The panel always keeps at least one admin, and you can't delete your own account.

### How it's built

- `functions/api/[[path]].js` handles every `/api/*` request: sign in and out, content, password changes, users, image uploads.
- `functions/_middleware.js` serves the published content at `/js/content.js` and returns 404 for repository files that aren't part of the site (`/data`, `/functions`, `README.md` …).
- `_routes.json` limits Functions to those paths, so normal pages are served as plain static files.
- Until the first publish, content comes from `data/content.json` in the repo (and `js/content.js` mirrors it for static fallback).
- Passwords are hashed with PBKDF2. Sessions are HttpOnly, SameSite=Strict cookies that expire after 8 hours. Logins are limited to 8 failures per 5 minutes per IP, and POSTs from other sites are rejected.
- Uploaded images (JPG, PNG, WebP, GIF or AVIF, up to 8 MB) are stored in KV and served from `/api/uploads/…`.

**Reset the admin login:** delete the `users` key in the KV namespace (Cloudflare dashboard → KV → your namespace). The next sign-in recreates admin / admin.

## Structure

```
index.html        Landing page: hero, showcase, two paths, featured homes, tagline, benefits, process, testimonials, FAQ, CTA
listings.html     All homes with status / bedroom filters, sorting, skeleton loading and empty state
property.html     Property detail, rendered from ?id=<property id>
build.html        Custom build journey and the indicative cost estimator
contact.html      Consultation booking form with inline validation
privacy.html      Privacy policy (draft template)
terms.html        Terms of use (draft template)
404.html          Branded not found page

css/
  tokens.css      Colors, spacing, radius, motion tokens
  base.css        Reset, named text styles (heading-1, body-3, caption-5, ...), layout helpers
  components.css  Nav, buttons, cards, forms, FAQ, footer, cookie banner, reveals
  pages.css       Page specific layouts

admin/            Admin panel (index.html, admin.css, admin.js)
functions/        Cloudflare Pages Functions: admin API and content middleware
_routes.json      Which paths run Functions (everything else is static)
data/content.json Starting content: listings, stats, testimonials, FAQs, build rates, settings (sample data)

js/
  content.js      Static copy of data/content.json; once published from the admin, KV content is served here instead
  data.js         Shapes the content for the page scripts
  render.js       Property card + skeleton renderers, price formatting
  main.js         Shared nav/footer, mobile menu, scroll reveals, tagline word reveal, counters, FAQ, cookie consent, form validation
  hero-canvas.js  Animated wireframe house in the hero
  home.js         Fills the landing page sections from data.js
  listings.js     Filtering and sorting
  property.js     Property detail renderer
  build.js        Estimator logic

assets/
  favicon.svg
  og-image.svg    Social preview (export a 1200x630 PNG for best platform support)
```

## Design system

- **Inspiration:** richardmarcushomes.com — pure black field, white Montserrat in light weights.
- **Fonts:** Montserrat (all text), Geist Mono (numbers and data readouts only).
- **Colors:** `#000000` base, `#131209` / `#181818` / `#1F1F1F` / `#272727` surfaces, white text, champagne accent `#C9A96E`.
- **Icons:** Phosphor (light weight) from unpkg.
- **Motion:** `cubic-bezier(0.22, 1, 0.36, 1)`, IntersectionObserver reveals, respects reduced motion.

## Before launch

1. Change the admin password, then replace the sample content from the admin panel (listings, prices, stats, testimonials, build rates).
2. Fill the placeholders marked `{{...}}`: phone number and studio address (Site settings in the admin), company legal name (privacy.html, terms.html).
3. Swap the Unsplash photos for your own photography.
4. Connect the forms in `js/main.js` (search for "Demo submit") to a real endpoint.
5. Have the privacy policy and terms reviewed.
6. Update the canonical URL and `og:image` to your live domain.
