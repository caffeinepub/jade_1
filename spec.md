# Specification

## Summary
**Goal:** Add a password gate to the admin panel so only authorized users can access it.

**Planned changes:**
- Display a centered password entry screen before any admin panel content is rendered, styled with the Jade luxury dark aesthetic (charcoal background, gold accents, cream text).
- Include a masked password input field and an "Enter" button.
- Grant access when the correct password (`Mrudani.jade.jyo.hem`) is entered; show an error message on incorrect attempts.
- Persist the authenticated state for the current browser session using `sessionStorage` so the user is not re-prompted on page reload.

**User-visible outcome:** Visiting the admin panel now requires entering the correct password before any admin content is shown. Once authenticated, the session persists until the browser tab/session is closed.
