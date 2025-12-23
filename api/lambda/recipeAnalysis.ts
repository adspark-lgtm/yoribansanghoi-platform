// ============================================
// Lambda: AI 레시피 분석 함수
// ============================================
// 음식 이미지 업로드 → AI 분석 → 레시피 디지털 트윈 생성

import { RekognitionClient, DetectLabelsCommand, DetectTextCommand } from '@aws-sdk/client-rekognition';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Anthropic from '@anthropic-ai/sdk';

// AWS 클라이언트 초기화
const rekognition = new RekognitionClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Anthropic Claude 클라이언트
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 요리반상회 700+ RMR 레시피 데이터베이스 (샘플)
const RECIPE_DATABASE = [
  {
    id: 'recipe-001',
    name: '동파육 라멘',
    category: 'ramen',
    keywords: ['동파육', '돼지고기', '라멘', '일식'],
    baseCost: 4200,
    sellingPrice: 12900,
    marginRate: 67.4,
    developer: '박찬일 셰프',
    processTime: 35,
  },
  {
    id: 'recipe-002',
    name: '용문 해장국',
    category: 'soup',
    keywords: ['해장국', '선지', '내장', '한식', '60년전통'],
    baseCost: 3800,
    sellingPrice: 9900,
    marginRate: 61.6,
    developer: '김왕민 소장',
    source: '용문해장국 60년 레시피',
    processTime: 45,
  },
  {
    id: 'recipe-003',
    name: '황금콩밭 콩국수',
    category: 'noodle',
    keywords: ['콩국수', '두유', '여름', '미쉐린'],
    baseCost: 2900,
    sellingPrice: 11000,
    marginRate: 73.6,
    developer: '황금콩밭',
    source: '미쉐린 선정 레시피',
    processTime: 20,
  },
  {
    id: 'recipe-004',
    name: '양갈비 라멘',
    category: 'ramen',
    keywords: ['양갈비', '램', '라멘', '프리미엄'],
    baseCost: 5800,
    sellingPrice: 16900,
    marginRate: 65.7,
    developer: '노재승 총괄셰프',
    processTime: 40,
  },
  {
    id: 'recipe-005',
    name: '잠봉 라멘',
    category: 'ramen',
    keywords: ['잠봉', '햄', '라멘', '프렌치'],
    baseCost: 4500,
    sellingPrice: 13900,
    marginRate: 67.6,
    developer: '멘야서울',
    processTime: 30,
  },
  {
    id: 'recipe-006',
    name: '등갈비 뼈찜',
    category: 'meat',
    keywords: ['등갈비', '뼈찜', '보양', '한식'],
    baseCost: 6200,
    sellingPrice: 18900,
    marginRate: 67.2,
    developer: '김왕민 소장',
    processTime: 90,
  },
];

// Lambda 핸들러
export const handler = async (event: any) => {
  console.log('Recipe Analysis Lambda triggered:', JSON.stringify(event));

  try {
    const { imageBase64, imageS3Key, analysisType = 'full' } = JSON.parse(event.body || '{}');

    if (!imageBase64 && !imageS3Key) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: false,
          error: { code: 'MISSING_IMAGE', message: '이미지가 필요합니다.' },
        }),
      };
    }

    // 1. 이미지 바이트 가져오기
    let imageBytes: Uint8Array;
    if (imageBase64) {
      imageBytes = Buffer.from(imageBase64, 'base64');
    } else {
      const s3Response = await s3.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_UPLOADS,
        Key: imageS3Key,
      }));
      imageBytes = await s3Response.Body?.transformToByteArray() || new Uint8Array();
    }

    // 2. AWS Rekognition으로 이미지 분석
    const rekognitionResult = await analyzeImageWithRekognition(imageBytes);

    // 3. Claude AI로 레시피 매칭 및 분석
    const aiAnalysis = await analyzeWithClaude(rekognitionResult);

    // 4. 레시피 DB에서 매칭
    const matchedRecipes = matchRecipes(rekognitionResult.labels, aiAnalysis);

    // 5. 디지털 트윈 생성
    const digitalTwin = generateDigitalTwin(matchedRecipes, aiAnalysis);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        data: {
          imageAnalysis: rekognitionResult,
          aiAnalysis,
          matchedRecipes,
          digitalTwin,
          launchRoadmap: generateLaunchRoadmap(digitalTwin),
        },
      }),
    };
  } catch (error: any) {
    console.error('Recipe analysis error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: { 
          code: 'ANALYSIS_ERROR', 
          message: error.message || '분석 중 오류가 발생했습니다.',
        },
      }),
    };
  }
};

// AWS Rekognition 이미지 분석
async function analyzeImageWithRekognition(imageBytes: Uint8Array) {
  // 라벨 감지 (음식 종류 파악)
  const labelsCommand = new DetectLabelsCommand({
    Image: { Bytes: imageBytes },
    MaxLabels: 20,
    MinConfidence: 70,
  });
  const labelsResult = await rekognition.send(labelsCommand);

  // 텍스트 감지 (메뉴명, 가격표 등)
  const textCommand = new DetectTextCommand({
    Image: { Bytes: imageBytes },
  });
  const textResult = await rekognition.send(textCommand);

  return {
    labels: labelsResult.Labels?.map(l => ({
      name: l.Name,
      confidence: l.Confidence,
      categories: l.Categories?.map(c => c.Name),
    })) || [],
    detectedText: textResult.TextDetections?.filter(t => t.Type === 'LINE')
      .map(t => t.DetectedText) || [],
    foodLabels: labelsResult.Labels?.filter(l => 
      l.Categories?.some(c => c.Name === 'Food and Beverage')
    ).map(l => l.Name) || [],
  };
}

// Claude AI 분석
async function analyzeWithClaude(rekognitionResult: any) {
  const prompt = `당신은 요리반상회의 AI 푸드 분석 전문가입니다.
  
다음 이미지 분석 결과를 바탕으로 레시피 디지털 트윈을 생성해주세요:

감지된 음식 라벨: ${rekognitionResult.foodLabels.join(', ')}
전체 라벨: ${rekognitionResult.labels.map((l: any) => `${l.name}(${l.confidence?.toFixed(1)}%)`).join(', ')}
감지된 텍스트: ${rekognitionResult.detectedText.join(', ')}

다음 형식으로 분석 결과를 JSON으로 반환해주세요:
{
  "predictedDish": "예상 음식명",
  "category": "ramen|soup|noodle|rice|side|sauce",
  "ingredients": ["예상 재료 목록"],
  "cookingMethod": "조리 방법 설명",
  "estimatedCost": 예상 원가(숫자),
  "suggestedPrice": 권장 판매가(숫자),
  "difficultyLevel": "easy|medium|hard",
  "optimizationTips": ["최적화 제안"],
  "matchKeywords": ["매칭용 키워드"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const content = response.content[0];
    if (content.type === 'text') {
      // JSON 파싱 시도
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (e) {
    console.error('Claude response parsing error:', e);
  }

  // 기본값 반환
  return {
    predictedDish: '분석 중',
    category: 'other',
    ingredients: [],
    cookingMethod: '',
    estimatedCost: 0,
    suggestedPrice: 0,
    difficultyLevel: 'medium',
    optimizationTips: [],
    matchKeywords: rekognitionResult.foodLabels,
  };
}

// 레시피 매칭
function matchRecipes(labels: any[], aiAnalysis: any) {
  const searchKeywords = [
    ...labels.map(l => l.name?.toLowerCase() || ''),
    ...(aiAnalysis.matchKeywords || []).map((k: string) => k.toLowerCase()),
    aiAnalysis.predictedDish?.toLowerCase() || '',
  ];

  const matches = RECIPE_DATABASE.map(recipe => {
    let score = 0;
    const matchedKeywords: string[] = [];

    recipe.keywords.forEach(keyword => {
      if (searchKeywords.some(sk => sk.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(sk))) {
        score += 20;
        matchedKeywords.push(keyword);
      }
    });

    if (recipe.category === aiAnalysis.category) {
      score += 15;
    }

    return {
      ...recipe,
      matchScore: Math.min(score, 100),
      matchedKeywords,
      similarity: score / 100,
    };
  }).filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return matches;
}

// 디지털 트윈 생성
function generateDigitalTwin(matchedRecipes: any[], aiAnalysis: any) {
  const topMatch = matchedRecipes[0];
  
  return {
    id: `twin-${Date.now()}`,
    basedOn: topMatch?.id || null,
    name: aiAnalysis.predictedDish || topMatch?.name || '신규 레시피',
    category: aiAnalysis.category || topMatch?.category,
    
    // 원가 구조
    costStructure: {
      ingredientCost: aiAnalysis.estimatedCost || topMatch?.baseCost || 0,
      laborCost: Math.round((aiAnalysis.estimatedCost || 3000) * 0.2),
      overheadCost: Math.round((aiAnalysis.estimatedCost || 3000) * 0.1),
      totalCost: aiAnalysis.estimatedCost || topMatch?.baseCost || 0,
    },
    
    // 가격 전략
    pricing: {
      suggested: aiAnalysis.suggestedPrice || topMatch?.sellingPrice || 0,
      marginRate: topMatch?.marginRate || 60,
      competitorRange: { min: 8000, max: 15000 },
    },
    
    // 공정 정보
    process: {
      totalTime: topMatch?.processTime || 30,
      difficulty: aiAnalysis.difficultyLevel || 'medium',
      steps: generateProcessSteps(aiAnalysis),
    },
    
    // 최적화 제안
    optimizations: aiAnalysis.optimizationTips || [],
    
    // 메타데이터
    confidence: topMatch?.matchScore || 50,
    createdAt: new Date().toISOString(),
  };
}

// 공정 단계 생성
function generateProcessSteps(aiAnalysis: any) {
  const baseSteps = [
    { order: 1, name: '재료 준비', duration: 10, description: '재료 계량 및 전처리' },
    { order: 2, name: '조리', duration: 15, description: '주 조리 공정' },
    { order: 3, name: '마무리', duration: 5, description: '플레이팅 및 마무리' },
  ];

  if (aiAnalysis.cookingMethod) {
    baseSteps[1].description = aiAnalysis.cookingMethod;
  }

  return baseSteps;
}

// 출시 로드맵 생성
function generateLaunchRoadmap(digitalTwin: any) {
  const startDate = new Date();
  
  return {
    totalDays: 50,
    phases: [
      {
        name: '레시피 검증',
        days: 7,
        startDate: startDate.toISOString(),
        tasks: ['원가 분석', '시식 테스트', '레시피 최적화'],
      },
      {
        name: '공장 매칭',
        days: 10,
        startDate: addDays(startDate, 7).toISOString(),
        tasks: ['공장 후보 선정', '설비 확인', '견적 비교'],
      },
      {
        name: '시제품 생산',
        days: 14,
        startDate: addDays(startDate, 17).toISOString(),
        tasks: ['파일럿 생산', '품질 테스트', '패키징 확정'],
      },
      {
        name: '양산 준비',
        days: 12,
        startDate: addDays(startDate, 31).toISOString(),
        tasks: ['생산 라인 세팅', 'HACCP 점검', '초도 물량 생산'],
      },
      {
        name: '출시',
        days: 7,
        startDate: addDays(startDate, 43).toISOString(),
        tasks: ['유통 배송', '마케팅 런칭', '판매 모니터링'],
      },
    ],
    estimatedLaunchDate: addDays(startDate, 50).toISOString(),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
