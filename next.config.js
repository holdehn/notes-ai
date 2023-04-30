/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };

    // Exclude the supabase folder from the build
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /supabase/,
      use: 'null-loader',
    });

    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
};

export default nextConfig;
