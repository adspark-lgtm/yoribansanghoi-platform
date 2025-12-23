'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// 히어로 섹션 데이터
const heroSlides = [
  {
    title: '레시피를 제품으로',
    subtitle: '50일 만에 HMR 출시',
    description: '700+ RMR 데이터베이스와 50+ 공장 네트워크로\n당신의 레시피를 상품화합니다',
    cta: '무료 상담 신청',
    image: '/images/hero-1.jpg',
  },
  {
    title: 'AI 레시피 분석',
    subtitle: '디지털 트윈 기술',
    description: '사진 한 장으로 원가, 공정, 마진율까지\n자동 분석하는 AI 시스템',
    cta: '레시피 분석하기',
    image: '/images/hero-2.jpg',
  },
  {
    title: '멘야서울 성공사례',
    subtitle: '월 매출 3억+ 달성',
    description: '라멘 토핑 HMR화로 신규 매출 창출\n마진율 65% 이상 달성',
    cta: '성공사례 보기',
    image: '/images/hero-3.jpg',
  },
];

// 서비스 카드 데이터
const services = [
  {
    icon: '🔬',
    title: 'AI 레시피 분석',
    description: '사진 업로드만으로 원가 구조, 공정 분석, 마진율 예측까지 자동으로',
    features: ['이미지 인식 AI', '원가 자동 계산', '디지털 트윈 생성'],
    link: '/analyze',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: '🏭',
    title: '공장 매칭',
    description: '50+ 검증된 OEM/ODM 파트너사와 최적의 생산 조건 매칭',
    features: ['실시간 매칭', 'MOQ 최적화', '품질 인증 확인'],
    link: '/factory',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '📊',
    title: '수익성 시뮬레이션',
    description: '판매가, 생산량에 따른 예상 수익과 손익분기점 실시간 계산',
    features: ['마진율 분석', 'BEP 계산', '시나리오 비교'],
    link: '/simulation',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '🚀',
    title: '50일 출시 로드맵',
    description: '레시피 검증부터 양산 출시까지 단계별 맞춤 일정 관리',
    features: ['마일스톤 관리', '진행률 추적', '리스크 알림'],
    link: '/roadmap',
    color: 'from-purple-500 to-pink-500',
  },
];

// 통계 데이터
const stats = [
  { number: '700+', label: 'RMR 레시피 DB', suffix: '' },
  { number: '50+', label: '파트너 공장', suffix: '' },
  { number: '50', label: '출시 소요일', suffix: '일' },
  { number: '65', label: '평균 마진율', suffix: '%+' },
];

// 성공사례 데이터
const caseStudies = [
  {
    brand: '멘야서울',
    category: '라멘 토핑',
    result: '월 매출 3억+',
    margin: '마진율 68%',
    period: '45일 출시',
    image: '/images/case-menyaseoul.jpg',
    testimonial: '요리반상회 덕분에 우리 시그니처 토핑을 HMR로 출시할 수 있었습니다.',
  },
  {
    brand: '한식명가',
    category: '밑반찬 세트',
    result: '월 매출 1.5억',
    margin: '마진율 62%',
    period: '38일 출시',
    image: '/images/case-hansik.jpg',
    testimonial: '복잡한 생산 과정을 원스톱으로 해결해주셔서 감사합니다.',
  },
  {
    brand: '이탈리안키친',
    category: '파스타 소스',
    result: '월 매출 2억',
    margin: '마진율 71%',
    period: '52일 출시',
    image: '/images/case-italian.jpg',
    testimonial: '공장 매칭부터 패키징까지 전문적인 컨설팅이 인상적이었습니다.',
  },
];

// 프로세스 단계
const processSteps = [
  { step: 1, title: '레시피 업로드', description: '사진 또는 레시피 문서 업로드', duration: '즉시' },
  { step: 2, title: 'AI 분석', description: '원가, 공정, 마진율 자동 분석', duration: '5분' },
  { step: 3, title: '공장 매칭', description: '최적 OEM 파트너 추천', duration: '1일' },
  { step: 4, title: '시제품 개발', description: '샘플 제작 및 테스트', duration: '14일' },
  { step: 5, title: '양산 및 출시', description: '대량 생산 및 유통 시작', duration: '30일' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
                🍳 요리반상회 AX Platform
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                {heroSlides[currentSlide].title}
                <span className="block text-primary">{heroSlides[currentSlide].subtitle}</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 whitespace-pre-line">
                {heroSlides[currentSlide].description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/consultation"
                  className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                >
                  {heroSlides[currentSlide].cta}
                </Link>
                <Link
                  href="/analyze"
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  레시피 분석 체험하기
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 right-10 z-20"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.number}
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">핵심 서비스</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI 기술과 전문 네트워크로 레시피 상품화의 모든 과정을 지원합니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={service.link}>
                  <div className="card h-full hover:shadow-xl transition-all group cursor-pointer">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}
                    >
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-500">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">50일 출시 프로세스</h2>
            <p className="text-xl text-gray-600">체계적인 5단계 프로세스로 빠르고 확실하게</p>
          </motion.div>

          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
            <div className="hidden md:block absolute top-1/2 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-primary-light -translate-y-1/2" />

            <div className="grid md:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {step.duration}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">성공 사례</h2>
            <p className="text-xl text-gray-400">요리반상회와 함께 성장한 파트너들</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                  <span className="text-6xl">🍜</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg">{study.brand}</span>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      {study.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-primary font-bold">{study.result}</div>
                      <div className="text-xs text-gray-400">매출</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">{study.margin}</div>
                      <div className="text-xs text-gray-400">수익률</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{study.period}</div>
                      <div className="text-xs text-gray-400">소요기간</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm italic">"{study.testimonial}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-red-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              무료 상담을 통해 레시피 상품화 가능성을 확인하고
              맞춤형 출시 로드맵을 받아보세요
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/consultation"
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                무료 상담 신청하기
              </Link>
              <Link
                href="/analyze"
                className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all"
              >
                AI 분석 체험하기
              </Link>
            </div>
            <p className="mt-6 text-white/60 text-sm">
              ✓ 무료 상담 ✓ 비밀유지 ✓ 24시간 내 연락
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="text-2xl font-bold text-white mb-4">요리반상회</div>
              <p className="text-sm mb-4">
                레시피를 제품으로, 50일 만에 HMR 출시
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">📷</a>
                <a href="#" className="hover:text-white transition-colors">📘</a>
                <a href="#" className="hover:text-white transition-colors">📺</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/analyze" className="hover:text-white">AI 레시피 분석</Link></li>
                <li><Link href="/factory" className="hover:text-white">공장 매칭</Link></li>
                <li><Link href="/simulation" className="hover:text-white">수익성 시뮬레이션</Link></li>
                <li><Link href="/roadmap" className="hover:text-white">출시 로드맵</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">회사 소개</Link></li>
                <li><Link href="/cases" className="hover:text-white">성공 사례</Link></li>
                <li><Link href="/blog" className="hover:text-white">블로그</Link></li>
                <li><Link href="/careers" className="hover:text-white">채용</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">문의</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 contact@yoribansanghoi.com</li>
                <li>📞 02-1234-5678</li>
                <li>📍 서울시 강남구 테헤란로 123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© 2024 요리반상회. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-white">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
