/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@apix/db", "@apix/shared-types"]
};

module.exports = nextConfig;
