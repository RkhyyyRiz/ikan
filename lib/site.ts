// URL situs tanpa hardcode domain: env di server, window.location.origin di browser.
export function siteUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}
