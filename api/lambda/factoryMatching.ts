// ============================================
// Lambda: 스마트 공장 매칭 함수
// ============================================
// 레시피 요구사항 → 50+ 공장 네트워크에서 최적 공장 매칭

import Anthropic from '@anthropic-ai/sdk';

// Anthropic Claude 클라이언트
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 요리반상회 50+ 공장 네트워크 데이터베이스 (샘플)
const FACTORY_DATABASE = [
  {
    id: 'factory-001',
    name: '서울식품가공',
    region: '경기',
    city: '안산시',
    certifications: ['HACCP', 'ISO22000', 'GMP'],
    equipment: [
      { type: 'mixer', capacity: '500kg/batch', status: 'available' },
      { type: 'cooker', capacity: '1000L', status: 'available' },
      { type: 'packaging', capacity: '10000팩/일', status: 'available' },
      { type: 'freezer', capacity: '50톤', status: 'available' },
    ],
    specialties: ['면류', '소스류', '반찬류'],
    moq: 1000,
    leadTime: 14,
    baseCostPerUnit: 1200,
    rating: 4.8,
    successfulProjects: 127,
    contact: { name: '김생산', phone: '031-123-4567' },
  },
  {
    id: 'factory-002',
    name: '부산푸드팩토리',
    region: '부산',
    city: '강서구',
    certifications: ['HACCP', 'ISO22000', 'FSSC22000'],
    equipment: [
      { type: 'cooker', capacity: '2000L', status: 'available' },
      { type: 'pasteurizer', capacity: '500L/h', status: 'available' },
      { type: 'filling', capacity: '5000병/일', status: 'available' },
      { type: 'labeling', capacity: '8000개/일', status: 'available' },
    ],
    specialties: ['탕류', '국물요리', '레토르트'],
    moq: 500,
    leadTime: 10,
    baseCostPerUnit: 1100,
    rating: 4.6,
    successfulProjects: 89,
    contact: { name: '박공장', phone: '051-234-5678' },
  },
  {
    id: 'factory-003',
    name: '대전식품연구소',
    region: '대전',
    city: '유성구',
    certifications: ['HACCP', 'ISO22000', 'KFDA인증'],
    equipment: [
      { type: 'mixer', capacity: '200kg/batch', status: 'available' },
      { type: 'fryer', capacity: '100kg/h', status: 'available' },
      { type: 'sterilizer', capacity: '1000개/batch', status: 'available' },
      { type: 'packaging', capacity: '5000팩/일', status: 'available' },
    ],
    specialties: ['간편식', 'HMR', '밀키트'],
    moq: 300,
    leadTime: 7,
    baseCostPerUnit: 1400,
    rating: 4.9,
    successfulProjects: 156,
    contact: { name: '이연구', phone: '042-345-6789' },
  },
  {
    id: 'factory-004',
    name: '충북농식품센터',
    region: '충북',
    city: '청주시',
    certifications: ['HACCP', 'GAP', '친환경인증'],
    equipment: [
      { type: 'cooker', capacity: '1500L', status: 'available' },
      { type: 'freezer', capacity: '100톤', status: 'available' },
      { type: 'packaging', capacity: '20000팩/일', status: 'in-use' },
    ],
    specialties: ['농산가공', '잼류', '절임류'],
    moq: 2000,
    leadTime: 21,
    baseCostPerUnit: 900,
    rating: 4.4,
    successfulProjects: 67,
    contact: { name: '최농업', phone: '043-456-7890' },
  },
  {
    id: 'factory-005',
    name: '전남식품클러스터',
    region: '전남',
    city: '나주시',
    certifications: ['HACCP', 'ISO22000', '수출위생'],
    equipment: [
      { type: 'mixer', capacity: '1000kg/batch', status: 'available' },
      { type: 'cooker', capacity: '3000L', status: 'available' },
      { type: 'pasteurizer', capacity: '1000L/h', status: 'available' },
      { type: 'packaging', capacity: '30000팩/일', status: 'available' },
      { type: 'freezer', capacity: '200톤', status: 'available' },
    ],
    specialties: ['수산가공', '젓갈류', '대량생산'],
    moq: 5000,
    leadTime: 14,
    baseCostPerUnit: 800,
    rating: 4.7,
    successfulProjects: 203,
    contact: { name: '정수산', phone: '061-567-8901' },
  },
];

// 장비 타입 매핑
const EQUIPMENT_REQUIREMENTS: Record<string, string[]> = {
  ramen: ['cooker', 'mixer', 'packaging'],
  soup: ['cooker', 'pasteurizer', 'filling'],
  noodle: ['mixer', 'cooker', 'packaging'],
  sauce: ['mixer', 'pasteurizer', 'filling'],
  side: ['cooker', 'packaging', 'freezer'],
  meat: ['cooker', 'freezer', 'packaging'],
};

// Lambda 핸들러
export const handler = async (event: any) => {
  console.log('Factory Matching Lambda triggered:', JSON.stringify(event));

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      recipeCategory,
      monthlyQuantity,
      budget,
      requiredCertifications = [],
      preferredRegion,
      urgency = 'normal', // normal, urgent, flexible
    } = body;

    if (!recipeCategory || !monthlyQuantity) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: false,
          error: { 
            code: 'MISSING_PARAMS', 
            message: '레시피 카테고리와 월 생산량이 필요합니다.' 
          },
        }),
      };
    }

    // 1. 기본 필터링
    const requiredEquipment = EQUIPMENT_REQUIREMENTS[recipeCategory] || [];
    let candidates = FACTORY_DATABASE.filter(factory => {
      // 활성 상태 확인
      const hasAvailableEquipment = requiredEquipment.every(eq =>
        factory.equipment.some(e => e.type === eq && e.status === 'available')
      );

      // MOQ 확인
      const meetsMOQ = monthlyQuantity >= factory.moq;

      // 인증 확인
      const meetsCertifications = requiredCertifications.length === 0 ||
        requiredCertifications.every((cert: string) => 
          factory.certifications.includes(cert)
        );

      return hasAvailableEquipment && meetsMOQ && meetsCertifications;
    });

    // 2. 지역 우선순위 적용
    if (preferredRegion) {
      candidates.sort((a, b) => {
        const aMatch = a.region === preferredRegion ? 1 : 0;
        const bMatch = b.region === preferredRegion ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    // 3. 매칭 스코어 계산
    const scoredCandidates = candidates.map(factory => {
      const score = calculateMatchScore(factory, {
        recipeCategory,
        monthlyQuantity,
        budget,
        requiredCertifications,
        preferredRegion,
        urgency,
      });

      const estimatedCost = calculateEstimatedCost(factory, monthlyQuantity);
      const estimatedLeadTime = calculateLeadTime(factory, urgency);

      return {
        factory,
        matchScore: score.total,
        scoreBreakdown: score.breakdown,
        estimatedCost,
        estimatedLeadTime,
        matchReasons: generateMatchReasons(factory, score),
        warnings: generateWarnings(factory, { budget, monthlyQuantity }),
      };
    });

    // 4. 상위 3개 추천
    const topMatches = scoredCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // 5. AI 분석 추가 (선택적)
    const aiRecommendation = await getAIRecommendation(topMatches, body);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        data: {
          totalCandidates: candidates.length,
          topMatches,
          aiRecommendation,
          searchCriteria: {
            recipeCategory,
            monthlyQuantity,
            budget,
            requiredCertifications,
            preferredRegion,
            urgency,
          },
        },
      }),
    };
  } catch (error: any) {
    console.error('Factory matching error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: { 
          code: 'MATCHING_ERROR', 
          message: error.message || '공장 매칭 중 오류가 발생했습니다.',
        },
      }),
    };
  }
};

// 매칭 스코어 계산
function calculateMatchScore(
  factory: typeof FACTORY_DATABASE[0],
  criteria: {
    recipeCategory: string;
    monthlyQuantity: number;
    budget?: number;
    requiredCertifications: string[];
    preferredRegion?: string;
    urgency: string;
  }
) {
  const breakdown: Record<string, number> = {};

  // 1. 전문성 점수 (30점)
  const specialtyMatch = factory.specialties.some(s => 
    s.toLowerCase().includes(criteria.recipeCategory) ||
    criteria.recipeCategory.includes(s.toLowerCase())
  );
  breakdown.specialty = specialtyMatch ? 30 : 15;

  // 2. 평점 점수 (20점)
  breakdown.rating = (factory.rating / 5) * 20;

  // 3. 성공 프로젝트 점수 (15점)
  breakdown.experience = Math.min(factory.successfulProjects / 200 * 15, 15);

  // 4. 가격 경쟁력 (15점)
  const avgCost = FACTORY_DATABASE.reduce((sum, f) => sum + f.baseCostPerUnit, 0) / FACTORY_DATABASE.length;
  breakdown.price = factory.baseCostPerUnit <= avgCost ? 15 : 10;

  // 5. 리드타임 점수 (10점)
  if (criteria.urgency === 'urgent') {
    breakdown.leadTime = factory.leadTime <= 10 ? 10 : 5;
  } else {
    breakdown.leadTime = factory.leadTime <= 14 ? 10 : 7;
  }

  // 6. 지역 점수 (10점)
  breakdown.region = criteria.preferredRegion && factory.region === criteria.preferredRegion ? 10 : 5;

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return { total, breakdown };
}

// 예상 비용 계산
function calculateEstimatedCost(factory: typeof FACTORY_DATABASE[0], quantity: number) {
  const unitCost = factory.baseCostPerUnit;
  
  // 물량 할인 적용
  let discount = 0;
  if (quantity >= 10000) discount = 0.15;
  else if (quantity >= 5000) discount = 0.10;
  else if (quantity >= 2000) discount = 0.05;

  const discountedUnitCost = unitCost * (1 - discount);
  const totalCost = discountedUnitCost * quantity;

  return {
    unitCost,
    discountRate: discount * 100,
    discountedUnitCost: Math.round(discountedUnitCost),
    totalCost: Math.round(totalCost),
    setupFee: quantity < 1000 ? 500000 : 0, // 소량 시 셋업비
  };
}

// 리드타임 계산
function calculateLeadTime(factory: typeof FACTORY_DATABASE[0], urgency: string) {
  let baseLeadTime = factory.leadTime;
  
  if (urgency === 'urgent') {
    return {
      standard: baseLeadTime,
      expedited: Math.ceil(baseLeadTime * 0.7),
      expediteFee: 200000, // 긴급 추가 비용
    };
  }
  
  return {
    standard: baseLeadTime,
    expedited: null,
    expediteFee: 0,
  };
}

// 매칭 사유 생성
function generateMatchReasons(factory: typeof FACTORY_DATABASE[0], score: { total: number; breakdown: Record<string, number> }) {
  const reasons: string[] = [];

  if (score.breakdown.specialty >= 25) {
    reasons.push(`${factory.specialties.join(', ')} 전문 생산 시설 보유`);
  }
  if (factory.rating >= 4.7) {
    reasons.push(`높은 평점 ${factory.rating}점 (${factory.successfulProjects}개 프로젝트 완료)`);
  }
  if (factory.certifications.includes('HACCP')) {
    reasons.push('HACCP 인증으로 식품 안전성 보장');
  }
  if (score.breakdown.price >= 15) {
    reasons.push('경쟁력 있는 가격 조건');
  }

  return reasons;
}

// 경고 생성
function generateWarnings(
  factory: typeof FACTORY_DATABASE[0],
  criteria: { budget?: number; monthlyQuantity: number }
) {
  const warnings: string[] = [];

  if (criteria.budget) {
    const estimatedTotal = factory.baseCostPerUnit * criteria.monthlyQuantity;
    if (estimatedTotal > criteria.budget) {
      warnings.push(`예상 비용이 예산을 ${Math.round((estimatedTotal - criteria.budget) / 10000)}만원 초과합니다`);
    }
  }

  if (criteria.monthlyQuantity < factory.moq * 1.2) {
    warnings.push(`최소 주문량(${factory.moq}개)에 근접합니다. 추가 협상이 필요할 수 있습니다`);
  }

  const inUseEquipment = factory.equipment.filter(e => e.status === 'in-use');
  if (inUseEquipment.length > 0) {
    warnings.push(`일부 장비(${inUseEquipment.map(e => e.type).join(', ')})가 사용 중입니다`);
  }

  return warnings;
}

// AI 추천 생성
async function getAIRecommendation(topMatches: any[], criteria: any) {
  if (topMatches.length === 0) {
    return { recommendation: '조건에 맞는 공장이 없습니다. 조건을 완화해 보세요.' };
  }

  try {
    const prompt = `당신은 요리반상회의 공장 매칭 전문가입니다.

다음 조건으로 공장 매칭을 진행했습니다:
- 레시피 카테고리: ${criteria.recipeCategory}
- 월 생산량: ${criteria.monthlyQuantity}개
- 예산: ${criteria.budget ? `${criteria.budget.toLocaleString()}원` : '미정'}
- 긴급도: ${criteria.urgency}

상위 3개 매칭 결과:
${topMatches.map((m, i) => `
${i + 1}. ${m.factory.name} (${m.factory.region})
   - 매칭 점수: ${m.matchScore}점
   - 예상 단가: ${m.estimatedCost.discountedUnitCost}원
   - 리드타임: ${m.estimatedLeadTime.standard}일
   - 전문분야: ${m.factory.specialties.join(', ')}
`).join('')}

간단하게 2-3문장으로 추천 의견을 제시해주세요.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return { recommendation: content.text };
    }
  } catch (error) {
    console.error('AI recommendation error:', error);
  }

  // 기본 추천
  const best = topMatches[0];
  return {
    recommendation: `${best.factory.name}을 1순위로 추천드립니다. ` +
      `${best.factory.specialties[0]} 전문 시설과 ${best.factory.rating}점의 높은 평점이 강점입니다.`,
  };
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

export default handler;
