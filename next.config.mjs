/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '*.supabase.co'
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  images: { remotePatterns: [{ protocol: 'https', hostname: supabaseHost }] },
}
export default nextConfig
