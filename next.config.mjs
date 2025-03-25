/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "www.elpalaciodehierro.com",
      },
    ],
  },
};

export default nextConfig;
