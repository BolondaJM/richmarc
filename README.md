# Richmarc Homes website

A static luxury home build and sales site in plain HTML, CSS and JavaScript. No build step.

## Run it locally

```bash
python server.py
```

Then open http://localhost:5173. The server uses only the Python standard library.

## Admin panel

Open http://localhost:5173/admin/ and sign in. The first test login is **admin / admin**; the panel shows a warning until you change it under Account.

From the panel you can add, edit, reorder, duplicate and delete:

- Homes (all fields, cover photo, gallery, features; photos can be uploaded)
- Testimonials, FAQs and home page stats
- Custom build estimator tiers and extras
- Site settings: email, phone, studio address, hours, footer text, social links

Edits stay in the browser until you click **Publish changes** (or Ctrl+S). Publishing writes `data/content.json`, keeps a timestamped backup in `data/backups/` (last 30), and regenerates `js/content.js`, which every page loads. Because the public pages only read that generated file, they can still be deployed to any static host; only editing needs `server.py` running.

Credentials are stored hashed (PBKDF2) in `data/admin.json`, which is git-ignored and never served. Delete that file to reset the login to admin / admin. The server binds to 127.0.0.1; put it behind HTTPS before exposing it to the internet.

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

server.py         Static server + admin API (login, save content, image upload)
admin/            Admin panel (index.html, admin.css, admin.js)
data/content.json ALL content: listings, stats, testimonials, FAQs, build rates, settings (sample data)

js/
  content.js      Generated from data/content.json on every publish. Do not edit by hand
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
