# Richmarc Homes website

A static luxury home build and sales site in plain HTML, CSS and JavaScript. No build step.

## Run it locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173. (Opening the files directly also works, but the 404 page uses root paths and expects a server.)

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

js/
  data.js         ALL content: listings, stats, testimonials, FAQs, build rates (sample data)
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

1. Replace the sample content in `js/data.js` (listings, prices, stats, testimonials, build rates).
2. Fill the placeholders marked `{{...}}`: phone number, studio address, company legal name.
3. Swap the Unsplash photos for your own photography.
4. Connect the forms in `js/main.js` (search for "Demo submit") to a real endpoint.
5. Have the privacy policy and terms reviewed.
6. Update the canonical URL and `og:image` to your live domain.
