# Motion Automotive

Car rental website: fleet inventory with make/type filters, online booking with an insurance choice (renter's own policy or a Motion coverage plan), booking lookup/change/cancel, and a staff dashboard for inventory and reservations.

Built with React, Vite, Tailwind v4 and Motion. The hero is adapted from the 21st.dev `hero-with-video` component (`src/components/ui/hero-with-video.tsx`, export `NavbarHero`).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Pages

| Route | What it does |
|---|---|
| `/` | Animated landing with pickup and date search, browse by make and type, daily/weekly rate tiers, insurance options, FAQ |
| `/fleet` | Inventory with filters (type, make, fuel, seats) and live availability for chosen dates |
| `/fleet/:id` | Car details, booked dates, reserve button |
| `/book/:id` | Checkout: trip, insurance (own policy or Essential/Standard/Complete), extras, driver |
| `/reservations` | Customer lookup by booking code + last name; change dates or cancel |
| `/staff` | Dashboard (demo PIN `2468`): bookings with status, pickup location and which ad they came from; add/edit/hide vehicles |
| `/airport-car-rental` | Ad landing page: airport pickup preselected |
| `/truck-rental` | Ad landing page: trucks |
| `/luxury-car-rental` | Ad landing page: luxury and sports cars |
| `/weekly-car-rental` | Ad landing page: weekly prices (7+ days, 15% off, sample) |

## Before launch

1. **Business details**: edit `src/config/business.ts` (phone, email, address, hours, rates, deposit, tax, coverage prices). All current values are samples.
   Social profiles go in `business.social` (Instagram, Facebook, TikTok, X, YouTube, Google reviews); each icon appears in both footers once its link is filled in, and the links are added to the Google business data.
2. **Fleet**: edit `src/data/fleet.ts` or use the staff dashboard. Replace the Unsplash stand-in photos with photos of the real cars (drop them in `src/assets/fleet/` named after the car id, e.g. `toyota-camry.webp`).
3. **Backend**: bookings and inventory are stored in the browser (localStorage) for the demo. Connect a database (e.g. Supabase) so staff see customer bookings, and replace the staff PIN with real login.
4. **Email and payments**: add confirmation emails and, if wanted, card holds/payments (e.g. Stripe). Checkout currently says "pay at pickup".
5. **Insurance wording**: have the client's insurer or agent review the coverage plan descriptions.
6. **Legal review**: `/privacy` and `/terms` (`src/pages/Legal.tsx`) are drafts written from what the site collects. Have a Louisiana attorney review them, then update `LAST_UPDATED`.
7. **Staff PIN**: the default is 2468. Pick a new PIN, run `printf 'motion-staff:NEWPIN' | sha256sum` and put the result in `VITE_STAFF_PIN_HASH`. This only keeps casual visitors out; real staff login comes with the backend (step 3).
8. **Hosting and HTTPS**: `vercel.json` and `netlify.toml` are included. Set the project's root directory to `motion-automotive`, add the environment variables, and connect the domain. Both hosts issue the HTTPS certificate automatically; the configs add HSTS (forces HTTPS), security headers, long caching for built files and the page-refresh rewrite.
9. **Check after going live**: share the link in a text message to see the preview image (`public/og-image.jpg`), submit `sitemap.xml` in Google Search Console, and run PageSpeed Insights on the home page.

### Launch checklist (already built in)

| | |
|---|---|
| Privacy policy, rental terms | `/privacy`, `/terms`, linked from footers and checkout |
| Cookie consent | Banner; Google and Meta tags load only after Accept. "Cookie settings" in the footer reopens it |
| No secrets in the code | Only public IDs are used; the staff PIN is stored as a hash |
| Search and sharing | Unique title and description per page, canonical links, social preview image, Google business data, sitemap and robots.txt |
| Icons | Favicon, Apple touch icon, web app manifest (`public/`) |
| Images | WebP, 900px wide, lazy loaded below the fold, alt text on every image |
| Speed | Pages load on demand; the footer animation and confetti load after the page |
| Accessibility | Text contrast checked in light and dark mode, labelled buttons, one heading per page |
| Mobile | No sideways scrolling on any page at phone width |
| 404 page | Friendly page with links back into the site |
| Forms | Field checks (email, phone, license, state, age, policy), hidden spam trap, minimum fill time, booking rate limit |

## Ads and tracking

Tracking is off until IDs are set. Copy `.env.example` to `.env` (or add the same variables in the hosting dashboard) and fill in:

| Variable | Where to find it |
|---|---|
| `VITE_SITE_URL` | The live address, e.g. `https://www.motionautomotivebr.com`. Turns on `sitemap.xml`, `robots.txt` and canonical links. |
| `VITE_GA_ID` | Google Analytics 4: Admin > Data streams > Measurement ID (`G-...`) |
| `VITE_GADS_ID`, `VITE_GADS_BOOKING_LABEL` | Google Ads: create a "Purchase" conversion called Booking, then Tag setup > Install the tag yourself (`AW-...` and the label) |
| `VITE_META_PIXEL_ID` | Meta Events Manager > Data sources > Pixel ID |

Events sent: page views, car viewed (`view_item` / `ViewContent`), checkout started (`begin_checkout` / `InitiateCheckout`) and booking confirmed (`purchase`, Google Ads conversion, `Purchase`) with the booking total as its value.

Tag every ad's final URL so bookings are credited in the staff dashboard ("Came from"), for example:

```
https://www.motionautomotivebr.com/truck-rental?utm_source=google&utm_medium=cpc&utm_campaign=trucks
https://www.motionautomotivebr.com/weekly-car-rental?utm_source=facebook&utm_medium=paid&utm_campaign=weekly
```

Google Ads adds `gclid` and Meta adds `fbclid` automatically; both are recorded too.
