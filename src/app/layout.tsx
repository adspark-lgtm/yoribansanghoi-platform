// ============================================
// 요리반상회 AX 플랫폼 - 루트 레이아웃
// ============================================
import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '요리반상회 AX 플랫폼',
    template: '%s | 요리반상회',
  },
  description: '아날로그 푸드 IP를 디지털 레시피로 변환하는 AI 기반 AX(AI Transformation) 플랫폼. 700개 이상의 RMR 레시피와 50개 이상의 제조 공장 네트워크를 보유.',
  keywords: [
    '요리반상회',
    'RMR',
    'HMR',
    '간편식',
    '레시피 개발',
    '공장 매칭',
    'AI 푸드',
    '식품 제조',
    '멘야서울',
    '용문해장국',
  ],
  authors: [{ name: '요리반상회' }],
  creator: '요리반상회',
  publisher: '요리반상회',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ax.yoribansanghoi.com',
    siteName: '요리반상회 AX 플랫폼',
    title: '요리반상회 AX 플랫폼',
    description: 'AI 기반 푸드 IP 디지털 트랜스포메이션',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '요리반상회 AX 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '요리반상회 AX 플랫폼',
    description: 'AI 기반 푸드 IP 디지털 트랜스포메이션',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C41E3A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-slate-900 text-white">
        <div id="app-root">
          {children}
        </div>
        
        {/* Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
