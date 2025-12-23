'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Factory {
  id: string;
  name: string;
  location: string;
  region: string;
  specialty: string[];
  equipment: string[];
  certifications: string[];
  capacity: {
    daily: number;
    monthly: number;
  };
  moq: number;
  leadTime: number;
  rating: number;
  experience: number;
  priceRange: {
    min: number;
    max: number;
  };
  matchScore?: number;
  estimatedCost?: number;
  availableDate?: string;
}

interface FilterOptions {
  region: string;
  category: string;
  certification: string;
  minMoq: number;
  maxMoq: number;
  sortBy: 'score' | 'price' | 'leadTime' | 'rating';
}

const regions = ['전체', '서울/경기', '충청', '경상', '전라', '강원', '제주'];
const categories = ['전체', '소스류', '면류', '반찬류', '밀키트', '냉동식품', '건강식품'];
const certifications = ['전체', 'HACCP', 'ISO22000', 'FSSC22000', '유기농', '할랄'];

// 샘플 공장 데이터
const sampleFactories: Factory[] = [
  {
    id: 'F001',
    name: '한식명가 OEM',
    location: '경기도 안성시',
    region: '서울/경기',
    specialty: ['소스류', '반찬류', '밀키트'],
    equipment: ['레토르트 살균기', '충전기', '진공포장기'],
    certifications: ['HACCP', 'ISO22000'],
    capacity: { daily: 10000, monthly: 250000 },
    moq: 1000,
    leadTime: 14,
    rating: 4.8,
    experience: 15,
    priceRange: { min: 1500, max: 5000 },
  },
  {
    id: 'F002',
    name: '프레시푸드 센터',
    location: '충청남도 천안시',
    region: '충청',
    specialty: ['면류', '밀키트', '냉동식품'],
    equipment: ['급속냉동기', '제면기', 'IQF'],
    certifications: ['HACCP', 'FSSC22000'],
    capacity: { daily: 15000, monthly: 350000 },
    moq: 2000,
    leadTime: 10,
    rating: 4.6,
    experience: 12,
    priceRange: { min: 2000, max: 6000 },
  },
  {
    id: 'F003',
    name: '건강식품 연구소',
    location: '경상북도 경주시',
    region: '경상',
    specialty: ['건강식품', '소스류'],
    equipment: ['추출기', '농축기', '분말화기'],
    certifications: ['HACCP', '유기농'],
    capacity: { daily: 5000, monthly: 120000 },
    moq: 500,
    leadTime: 21,
    rating: 4.9,
    experience: 20,
    priceRange: { min: 3000, max: 10000 },
  },
  {
    id: 'F004',
    name: '글로벌푸드 코리아',
    location: '전라남도 광양시',
    region: '전라',
    specialty: ['소스류', '반찬류'],
    equipment: ['살균기', '충전기', '라벨러'],
    certifications: ['HACCP', 'ISO22000', '할랄'],
    capacity: { daily: 20000, monthly: 500000 },
    moq: 3000,
    leadTime: 12,
    rating: 4.7,
    experience: 18,
    priceRange: { min: 1200, max: 4500 },
  },
  {
    id: 'F005',
    name: '프리미엄 키친',
    location: '서울시 강서구',
    region: '서울/경기',
    specialty: ['밀키트', '면류'],
    equipment: ['스팀쿠커', '블라스트칠러', '진공포장기'],
    certifications: ['HACCP', 'FSSC22000'],
    capacity: { daily: 8000, monthly: 180000 },
    moq: 500,
    leadTime: 7,
    rating: 4.5,
    experience: 8,
    priceRange: { min: 2500, max: 7000 },
  },
];

export default function FactoryPage() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    region: '전체',
    category: '전체',
    certification: '전체',
    minMoq: 0,
    maxMoq: 10000,
    sortBy: 'score',
  });

  useEffect(() => {
    loadFactories();
  }, [filters]);

  const loadFactories = async () => {
    setIsLoading(true);
    
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let filtered = [...sampleFactories];
    
    // 필터 적용
    if (filters.region !== '전체') {
      filtered = filtered.filter((f) => f.region === filters.region);
    }
    if (filters.category !== '전체') {
      filtered = filtered.filter((f) => f.specialty.includes(filters.category));
    }
    if (filters.certification !== '전체') {
      filtered = filtered.filter((f) => f.certifications.includes(filters.certification));
    }
    filtered = filtered.filter(
      (f) => f.moq >= filters.minMoq && f.moq <= filters.maxMoq
    );

    // 매칭 점수 계산 (시뮬레이션)
    filtered = filtered.map((f) => ({
      ...f,
      matchScore: Math.round(70 + Math.random() * 25),
      estimatedCost: Math.round(f.priceRange.min + (f.priceRange.max - f.priceRange.min) * 0.4),
      availableDate: new Date(Date.now() + f.leadTime * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
    }));

    // 정렬
    switch (filters.sortBy) {
      case 'score':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'price':
        filtered.sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0));
        break;
      case 'leadTime':
        filtered.sort((a, b) => a.leadTime - b.leadTime);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFactories(filtered);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            ← 홈으로
          </Link>
          <h1 className="text-4xl font-bold mb-4">공장 매칭</h1>
          <p className="text-xl text-white/80">
            50+ 검증된 OEM/ODM 파트너사와 최적의 생산 조건 매칭
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-80 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">필터</h3>

              {/* Region */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Certification */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">인증</label>
                <select
                  value={filters.certification}
                  onChange={(e) => setFilters({ ...filters, certification: e.target.value })}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {certifications.map((cert) => (
                    <option key={cert} value={cert}>{cert}</option>
                  ))}
                </select>
              </div>

              {/* MOQ Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MOQ 범위: {filters.minMoq.toLocaleString()} - {filters.maxMoq.toLocaleString()}개
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={filters.maxMoq}
                  onChange={(e) => setFilters({ ...filters, maxMoq: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'score', label: '매칭률' },
                    { value: 'price', label: '가격' },
                    { value: 'leadTime', label: '납기' },
                    { value: 'rating', label: '평점' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, sortBy: option.value as FilterOptions['sortBy'] })}
                      className={`p-2 rounded-lg text-sm ${
                        filters.sortBy === option.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFilters({
                  region: '전체',
                  category: '전체',
                  certification: '전체',
                  minMoq: 0,
                  maxMoq: 10000,
                  sortBy: 'score',
                })}
                className="w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mb-4 px-4 py-2 bg-white rounded-xl shadow flex items-center gap-2"
            >
              <span>필터</span>
              <span className="text-primary">{showFilters ? '▲' : '▼'}</span>
            </button>

            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {factories.length}개의 공장이 검색되었습니다
              </p>
            </div>

            {/* Factory List */}
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="mt-4 text-gray-600">공장을 검색하고 있습니다...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {factories.map((factory, index) => (
                  <motion.div
                    key={factory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedFactory(factory)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Factory Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                        🏭
                      </div>

                      {/* Factory Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{factory.name}</h3>
                            <p className="text-gray-500">{factory.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{factory.matchScore}%</div>
                            <div className="text-sm text-gray-500">매칭률</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {factory.specialty.map((spec, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {spec}
                            </span>
                          ))}
                          {factory.certifications.map((cert, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">예상 단가</div>
                            <div className="font-medium">₩{factory.estimatedCost?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">최소 주문량</div>
                            <div className="font-medium">{factory.moq.toLocaleString()}개</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">납기</div>
                            <div className="font-medium">{factory.leadTime}일</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">평점</div>
                            <div className="font-medium">⭐ {factory.rating}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Factory Detail Modal */}
      <AnimatePresence>
        {selectedFactory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFactory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl">
                      🏭
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedFactory.name}</h2>
                      <p className="text-gray-500">{selectedFactory.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFactory(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Match Score */}
                <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <span className="font-medium text-gray-700">매칭 점수</span>
                  <span className="text-3xl font-bold text-primary">{selectedFactory.matchScore}%</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">예상 단가</div>
                    <div className="text-xl font-bold">₩{selectedFactory.estimatedCost?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">최소 주문량</div>
                    <div className="text-xl font-bold">{selectedFactory.moq.toLocaleString()}개</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">생산 가능일</div>
                    <div className="text-xl font-bold">{selectedFactory.availableDate}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">납기</div>
                    <div className="text-xl font-bold">{selectedFactory.leadTime}일</div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">보유 인증</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFactory.certifications.map((cert, i) => (
                      <span key={i} className="px-3 py-2 bg-green-100 text-green-600 rounded-xl">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">보유 장비</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFactory.equipment.map((eq, i) => (
                      <span key={i} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-xl">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialty */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">전문 분야</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFactory.specialty.map((spec, i) => (
                      <span key={i} className="px-3 py-2 bg-purple-100 text-purple-600 rounded-xl">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">⭐ {selectedFactory.rating}</div>
                    <div className="text-sm text-gray-500">평점</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedFactory.experience}년</div>
                    <div className="text-sm text-gray-500">경력</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedFactory.capacity.daily.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">일 생산량</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedFactory(null)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    닫기
                  </button>
                  <Link
                    href={`/consultation?factory=${selectedFactory.id}`}
                    className="flex-1 btn-primary py-3 rounded-xl text-center"
                  >
                    상담 신청
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
