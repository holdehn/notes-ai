/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };

    // Exclude the entire supabase folder from the build
    config.module.rules.push({
      test: /supabase[\\/].*\.(ts|js)$/,
      use: 'ignore-loader',
    });

    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
};

export default nextConfig;
