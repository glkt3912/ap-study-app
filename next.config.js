/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Bundle Analyzer用
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  }
}

module.exports = nextConfig