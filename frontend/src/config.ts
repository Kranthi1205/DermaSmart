// VITE_API_URL wins when it is set. Otherwise a production build talks to the
// deployed backend and a dev build talks to the local one. Falling back to
// localhost in production made the live site call the visitor's own machine
// whenever the variable was missing from the hosting build settings.
const PRODUCTION_API_URL = "https://dermasmart-dnuj.onrender.com";
const DEVELOPMENT_API_URL = "http://localhost:8000";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : DEVELOPMENT_API_URL);
