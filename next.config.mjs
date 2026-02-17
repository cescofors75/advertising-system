/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Desactivado para evitar problemas con Supabase Realtime
};

export default nextConfig;
