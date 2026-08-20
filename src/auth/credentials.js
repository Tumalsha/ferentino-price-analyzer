// This is a lightweight access gate, NOT real authentication.
// Anyone who views this app's JavaScript bundle (browser dev tools,
// "view source") can read these values. This only stops casual
// navigation to /admin — it does not protect the pricing data from
// someone who actually wants to bypass it.
//
// If unauthorized edits to your prices would be a real business risk,
// replace this with server-side login (e.g. a small backend that issues
// a session token) rather than editing the values below.
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'ferentino2026';
