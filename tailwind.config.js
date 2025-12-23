/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 요리반상회 브랜드 컬러
      colors: {
        yori: {
          primary: '#C41E3A',      // 메인 레드
          secondary: '#8B0000',    // 다크 레드
          accent: '#FF6B6B',       // 밝은 레드
          gold: '#D4AF37',         // 골드
          cream: '#FFF8E7',        // 크림
          charcoal: '#1A1A2E',     // 차콜
          slate: '#16213E',        // 슬레이트
          navy: '#0F3460',         // 네이비
        },
        // 멘야서울 서브 브랜드
        menya: {
          black: '#0D0D0D',
          white: '#FAFAFA',
          red: '#E63946',
          gold: '#C9A227',
        }
      },
      // 폰트 패밀리
      fontFamily: {
        sans: ['Noto Sans KR', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['Noto Serif KR', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      // 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      // 그림자
      boxShadow: {
        'yori': '0 4px 20px rgba(196, 30, 58, 0.15)',
        'yori-lg': '0 10px 40px rgba(196, 30, 58, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      // 백드롭 블러
      backdropBlur: {
        'xs': '2px',
      },
      // 간격
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // 반응형 브레이크포인트
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  darkMode: 'class',
};
