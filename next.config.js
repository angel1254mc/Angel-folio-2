/** @type {import('next').NextConfig} */
const nextConfig = {
   transpilePackages: ['next-mdx-remote'],
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'i.imgur.com',
            port: '',
            pathname: '/**',
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
         },
         {
            protocol: 'https',
            hostname: 'is1-ssl.mzstatic.com',
            port: '',
            pathname: '/**',
         },
         {
            protocol: 'https',
            hostname: 'cdn-images.dzcdn.net',
            port: '',
            pathname: '/**',
         },
         {
            protocol: 'https',
            hostname: 'cdn.discordapp.com',
            port: '',
            pathname: '/**',
         },
      ],
   },
   reactStrictMode: false,
};

module.exports = nextConfig;
