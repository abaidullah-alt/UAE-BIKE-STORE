# Manual Testing Checklist

Automated unit tests (`npm test`) cover pure business logic — validation rules, formatting, the bike size calculator. Everything below requires a real browser and database, so it's a manual pass. Work through this before considering the site launch-ready.

## Customer — Browsing
- [ ] Homepage loads, hero/categories/featured products render correctly
- [ ] `/shop` — filters (category, brand, price) work individually and combined
- [ ] `/shop` — sorting (newest, price asc/desc, featured) changes order correctly
- [ ] Category pages load, show correct products and subcategory chips
- [ ] Search returns relevant results; type-ahead suggestions appear after 2+ characters
- [ ] Product page — gallery, variant selection, spec table, size guide all work
- [ ] Product page — stock status is accurate (in stock / low / out of stock)

## Customer — Account
- [ ] Register with a new email — succeeds
- [ ] Register with an already-used email — shows a clear error, doesn't leak whether it's the email or something else
- [ ] Register with a weak password — rejected with a specific reason
- [ ] Login with correct credentials — succeeds
- [ ] Login with wrong password — generic error (doesn't confirm the email exists)
- [ ] Login 6+ times with wrong password in a row — rate-limited
- [ ] Wishlist — add/remove items, persists across sessions
- [ ] Addresses — add, delete, set default

## Customer — Cart & Checkout
- [ ] Add to cart as a guest (not logged in) — works, persists on page refresh
- [ ] Add to cart while logged in — tied to account, not lost on logout/login
- [ ] Cart quantity +/- respects available stock (can't exceed it)
- [ ] Remove item from cart — updates totals immediately
- [ ] Checkout — all required fields validate (try submitting empty, invalid phone, invalid email)
- [ ] Checkout — apply a valid coupon, confirm discount reflected in total
- [ ] Checkout — apply an expired/invalid/over-limit coupon, confirm clear error
- [ ] Checkout — Cash on Delivery completes successfully, order appears in `/account/orders`
- [ ] **Concurrency check**: open the same product in two browser tabs, reduce stock to 1 via admin, try to check out both — second one should fail gracefully, not oversell
- [ ] Order confirmation shows correct items, totals, and address
- [ ] Invoice page renders and prints cleanly

## Admin — Access Control
- [ ] Logged-out user hitting `/admin` — redirected to login
- [ ] Logged-in customer (no role) hitting `/admin` — redirected away, not shown the dashboard
- [ ] Staff account can only do what their role permits (test with a non-Super-Admin role if you create one)

## Admin — Catalog
- [ ] Create a product with images, specs, and stock — appears correctly on the storefront
- [ ] Edit a product's price — storefront reflects the change
- [ ] Delete a product — removed from storefront, confirm no orphaned cart items break
- [ ] Create/delete categories and brands

## Admin — Orders & Inventory
- [ ] Change an order's status — customer-facing timeline updates to match
- [ ] Add tracking number — appears on customer order detail page
- [ ] Issue a refund — payment status updates, shows on order detail
- [ ] Adjust stock manually — inventory number updates, logged in `InventoryTransaction`
- [ ] Low stock / out of stock badges appear at the right thresholds

## Admin — Reports & Analytics
- [ ] Dashboard KPIs reflect real order data
- [ ] Reports page charts render with real data (place a few varied test orders first)
- [ ] Conversion funnel numbers make sense relative to actual browsing/purchases

## Cross-cutting
- [ ] Mobile viewport (375px wide) — header, product grid, cart, checkout all usable
- [ ] Tablet viewport (768px) — layout doesn't break
- [ ] Arabic/RTL toggle — layout mirrors correctly, no overlapping elements
- [ ] Slow network (throttle to 3G in DevTools) — pages still usable, no infinite spinners
- [ ] Browser back button after checkout — doesn't allow re-submitting the same order

## Known limitations to keep in mind while testing
- Online payment doesn't charge a real card yet (flagged in checkout UI)
- Product images are URL-based, no file upload yet
- Only English is translated on non-homepage pages currently
- Rate limiter resets on server restart (in-memory, not distributed)
