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
| `/` | Video hero with date search, browse by make and type, insurance options, FAQ |
| `/fleet` | Inventory with filters (type, make, fuel, seats) and live availability for chosen dates |
| `/fleet/:id` | Car details, booked dates, reserve button |
| `/book/:id` | Checkout: trip, insurance (own policy or Essential/Standard/Complete), extras, driver |
| `/reservations` | Customer lookup by booking code + last name; change dates or cancel |
| `/staff` | Dashboard (demo PIN `2468`): bookings with status updates, add/edit/hide vehicles |

## Before launch

1. **Business details**: edit `src/config/business.ts` (phone, email, address, hours, rates, deposit, tax, coverage prices). All current values are samples.
2. **Fleet**: edit `src/data/fleet.ts` or use the staff dashboard. Replace the Unsplash stand-in photos with photos of the real cars (put files in `public/fleet/`).
3. **Backend**: bookings and inventory are stored in the browser (localStorage) for the demo. Connect a database (e.g. Supabase) so staff see customer bookings, and replace the staff PIN with real login.
4. **Email and payments**: add confirmation emails and, if wanted, card holds/payments (e.g. Stripe). Checkout currently says "pay at pickup".
5. **Insurance wording**: have the client's insurer or agent review the coverage plan descriptions.
