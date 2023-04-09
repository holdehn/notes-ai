/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };

    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
};

export default nextConfig;

//This configuration should help with the fs module issue, but keep in mind that it's a workaround and might not be the best solution. It's still recommended to address the root cause of the problem, which might be related to the package or its usage.
