'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FormData {
  name: string;
  company: string;
  phone: string;
  email: string;
  projectType: string;
  category: string;
  budget: string;
  timeline: string;
  description: string;
  hasRecipe: boolean;
  hasFactory: boolean;
  marketingPlan: string;
  referralSource: string;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

const projectTypes = [
  { value: 'new_product', label: '신제품 개발', icon: '🆕' },
  { value: 'recipe_commercialize', label: '레시피 상품화', icon: '📝' },
  { value: 'oem_matching', label: 'OEM 공장 매칭', icon: '🏭' },
  { value: 'cost_optimization', label: '원가 최적화', icon: '💰' },
  { value: 'brand_launch', label: '브랜드 론칭', icon: '🚀' },
  { value: 'consulting', label: '사업 컨설팅', icon: '💼' },
];

const categories = [
  '소스류', '면류', '반찬류', '밀키트', '냉동식품', '건강식품', '음료', '디저트', '기타'
];

const budgets = [
  { value: 'under_10m', label: '1천만원 미만' },
  { value: '10m_30m', label: '1천만원 ~ 3천만원' },
  { value: '30m_50m', label: '3천만원 ~ 5천만원' },
  { value: '50m_100m', label: '5천만원 ~ 1억원' },
  { value: 'over_100m', label: '1억원 이상' },
  { value: 'undecided', label: '미정' },
];

const timelines = [
  { value: 'urgent', label: '1개월 이내 (긴급)' },
  { value: '1_2months', label: '1~2개월' },
  { value: '2_3months', label: '2~3개월' },
  { value: '3_6months', label: '3~6개월' },
  { value: 'flexible', label: '유연함' },
];

export default function ConsultationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    phone: '',
    email: '',
    projectType: '',
    category: '',
    budget: '',
    timeline: '',
    description: '',
    hasRecipe: false,
    hasFactory: false,
    marketingPlan: '',
    referralSource: '',
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
      if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요';
      else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
        newErrors.phone = '올바른 연락처를 입력해주세요';
      }
      if (!formData.email.trim()) newErrors.email = '이메일을 입력해주세요';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '올바른 이메일을 입력해주세요';
      }
    }

    if (step === 2) {
      if (!formData.projectType) newErrors.projectType = '프로젝트 유형을 선택해주세요';
      if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
    }

    if (step === 3) {
      if (!formData.budget) newErrors.budget = '예산 범위를 선택해주세요';
      if (!formData.timeline) newErrors.timeline = '희망 일정을 선택해주세요';
    }

    if (step === 4) {
      if (!formData.agreePrivacy) newErrors.agreePrivacy = '개인정보 처리방침에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('제출 중 오류가 발생했습니다');

      setIsSubmitted(true);
    } catch {
      setErrors({ name: '제출 중 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-12 shadow-lg max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center text-5xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            상담 신청이 완료되었습니다
          </h1>
          <p className="text-gray-600 mb-8">
            입력하신 연락처로 24시간 이내에 전문 컨설턴트가 연락드리겠습니다.
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/analyze"
              className="block w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              AI 분석 체험하기
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            ← 홈으로
          </Link>
          <h1 className="text-4xl font-bold mb-4">무료 상담 신청</h1>
          <p className="text-xl text-white/80">
            전문 컨설턴트가 맞춤형 솔루션을 제안해드립니다
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>기본 정보</span>
              <span>프로젝트</span>
              <span>예산/일정</span>
              <span>추가 정보</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="홍길동"
                    className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사/브랜드명
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateFormData('company', e.target.value)}
                    placeholder="(주)요리반상회"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="010-1234-5678"
                    className={`input w-full ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="example@email.com"
                    className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Project Info */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    프로젝트 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {projectTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateFormData('projectType', type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.projectType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.projectType && (
                    <p className="text-red-500 text-sm mt-2">{errors.projectType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasRecipe}
                      onChange={(e) => updateFormData('hasRecipe', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>레시피 보유</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasFactory}
                      onChange={(e) => updateFormData('hasFactory', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>생산공장 보유</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 3: Budget & Timeline */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">예산 및 일정</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    예상 예산 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgets.map((budget) => (
                      <button
                        key={budget.value}
                        onClick={() => updateFormData('budget', budget.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.budget === budget.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {budget.label}
                      </button>
                    ))}
                  </div>
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-2">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    희망 출시 일정 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {timelines.map((timeline) => (
                      <button
                        key={timeline.value}
                        onClick={() => updateFormData('timeline', timeline.value)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                          formData.timeline === timeline.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {timeline.label}
                      </button>
                    ))}
                  </div>
                  {errors.timeline && (
                    <p className="text-red-500 text-sm mt-2">{errors.timeline}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Additional Info */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">추가 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트 상세 설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="프로젝트에 대해 자세히 알려주세요"
                    rows={4}
                    className="input w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마케팅/유통 계획
                  </label>
                  <textarea
                    value={formData.marketingPlan}
                    onChange={(e) => updateFormData('marketingPlan', e.target.value)}
                    placeholder="판매 채널, 마케팅 계획 등"
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요리반상회를 알게 된 경로
                  </label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => updateFormData('referralSource', e.target.value)}
                    className="input w-full"
                  >
                    <option value="">선택</option>
                    <option value="search">검색</option>
                    <option value="sns">SNS</option>
                    <option value="referral">지인 소개</option>
                    <option value="news">뉴스/기사</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreePrivacy}
                      onChange={(e) => updateFormData('agreePrivacy', e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      <span className="text-red-500">[필수]</span> 개인정보 처리방침에 동의합니다
                    </span>
                  </label>
                  {errors.agreePrivacy && (
                    <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>
                  )}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeMarketing}
                      onChange={(e) => updateFormData('agreeMarketing', e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      [선택] 마케팅 정보 수신에 동의합니다
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  이전
                </button>
              ) : (
                <div />
              )}
              {currentStep < totalSteps ? (
                <button onClick={handleNext} className="btn-primary px-8 py-3 rounded-xl">
                  다음
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? '제출 중...' : '상담 신청하기'}
                </button>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: '💬', title: '무료 상담', desc: '비용 부담 없이 전문 상담' },
              { icon: '🔒', title: '비밀 유지', desc: '레시피 정보 철저히 보호' },
              { icon: '⚡', title: '빠른 응답', desc: '24시간 이내 연락' },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-bold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
