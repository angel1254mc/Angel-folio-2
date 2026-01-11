/** @type {import('next').NextConfig} */
const nextConfig = {
   webpack: (config) => {
    config.externals.push("pino");
    return config;
  },
   transpilePackages: ['next-mdx-remote'],
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'i.imgur.com',
            port: '',
            pathname: '/**'
         },
         {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
            port: '',
            pathname: '/**',
         },
         {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
            pathname: '/**',
         },
         {
            protocol: 'https',
            hostname: 'i.scdn.co',
            port: '',
            pathname: '/**',
         }
      ],
   },
   reactStrictMode: false,
};

module.exports = nextConfig;
