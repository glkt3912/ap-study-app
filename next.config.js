/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス最適化
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // 本番環境でのデバッグページ除外
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    return []
  },
  async redirects() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/debug',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/api-test',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/env-check',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/css-test',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/simple',
          destination: '/404',
          permanent: false,
        },
        {
          source: '/test-dark',
          destination: '/404',
          permanent: false,
        },
      ]
    }
    return []
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

export default nextConfig