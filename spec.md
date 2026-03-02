# Specification

## Summary
**Goal:** Add a user Profile page with authentication info and order lookup to the Jade storefront.

**Planned changes:**
- Add a `/profile` route in `App.tsx`
- Create a `Profile` page that shows a sign-in prompt (with Internet Identity button) for unauthenticated users, or the user's abbreviated principal ID and a sign-out button for authenticated users
- Add a "My Orders" section on the Profile page where authenticated users can enter an order ID to retrieve and display order details (order ID, date, total price, item list, and status using the existing `OrderStatusTimeline` component)
- Add a "Profile" navigation link/icon in the site header (`Header.tsx`) for both desktop and mobile menus, visually highlighted when the user is authenticated
- Reuse existing `useInternetIdentity` and `useGetOrder` hooks; maintain the existing Jade luxury dark editorial theme

**User-visible outcome:** Users can navigate to a Profile page from the header, sign in or out via Internet Identity, and look up past orders by order ID to view their details and status.
