/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    domains: [
      'yoribansanghoi-assets.s3.ap-northeast-2.amazonaws.com',
      'images.unsplash.com'
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 환경변수 공개 설정
  env: {
    NEXT_PUBLIC_APP_NAME: '요리반상회 AX 플랫폼',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // API 리다이렉트 (Lambda 연동)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.AWS_API_GATEWAY_URL}/:path*`,
      },
    ];
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // 실험적 기능
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
