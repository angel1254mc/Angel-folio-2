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
            hostname:
               'https://cdn.discordapp.com/attachments/722671549299294239/1076807623950749736/',
            port: '',
            pathname: '/**',
         },
      ],
   },
   reactStrictMode: false,
};

module.exports = nextConfig;
