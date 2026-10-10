# Ember & Oak

An animated restaurant website built with Next.js, Tailwind CSS, Motion and three.js.

- **3D hero**: real dish photos on a round plate with depth parallax, an ember dissolve between dishes, and floating embers and steam
- **Flip-book menu**: pages turn in 3D, with chapter shortcuts, photo banners, and one-tap "add to order"
- **Dish viewer**: ingredients, allergens and a drag-to-rotate plate view
- **Ordering**: cart drawer with pickup or delivery (simulated, with no payment)
- **Reservations**: validated booking form (simulated)
- Also: intro curtain, custom cursor, pinned horizontal showcase, 3D reviews carousel, scroll-reveal sections. Animations are reduced when the device asks for less motion.

The original version of the page is kept at `/classic`.

## Run it

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # development: http://localhost:3000
```

Production:

```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

On Windows you can double-click **`start-site.bat`**. It builds the site the first time, then starts it and prints the address to open on other devices on the same Wi-Fi.

## Where things are

| What | File |
| --- | --- |
| Dishes, prices, ingredients | `src/lib/dishes.ts` |
| Hours, reviews, gallery, image paths | `src/lib/data.ts` |
| Page sections | `src/components/` |
| 3D scenes | `src/components/three/` |
| Photos | `public/images/` |

The ordering and booking forms don't send anything yet. Look for `// Replace with a real ... API call` in `src/components/order/CartDrawer.tsx` and `src/components/Reservation.tsx`.

All names, prices, reviews and contact details are placeholder content.
