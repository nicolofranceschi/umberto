/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/cinzia.app",
        destination: "https://cinzia.app",
        permanent: true,
      }
    ];
  },
};

module.exports = nextConfig;
