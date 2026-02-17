/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'visittoo.blob.core.windows.net',
        pathname: '/publitaxi/**',
      },
    ],
  },
};

export default nextConfig;
