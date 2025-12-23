import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// 700+ RMR 레시피 데이터베이스 (샘플)
const recipeDatabase = [
  { id: 'R001', name: '돈코츠 라멘', category: '면류', keywords: ['라멘', '돼지뼈', '차슈', '면'] },
  { id: 'R002', name: '미소 라멘', category: '면류', keywords: ['라멘', '된장', '미소', '면'] },
  { id: 'R003', name: '까르보나라', category: '파스타', keywords: ['파스타', '크림', '베이컨', '치즈'] },
  { id: 'R004', name: '불고기 덮밥', category: '한식', keywords: ['불고기', '밥', '소고기', '양념'] },
  { id: 'R005', name: '김치찌개', category: '한식', keywords: ['김치', '찌개', '돼지고기', '두부'] },
  { id: 'R006', name: '마라탕', category: '중식', keywords: ['마라', '탕', '버섯', '고기'] },
  { id: 'R007', name: '떡볶이', category: '분식', keywords: ['떡', '고추장', '어묵', '분식'] },
  { id: 'R008', name: '제육볶음', category: '한식', keywords: ['돼지고기', '고추장', '볶음', '양파'] },
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: '이미지가 필요합니다' },
        { status: 400 }
      );
    }

    // 이미지를 base64로 변환
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // Claude API로 이미지 분석
    const analysisPrompt = `당신은 요리 전문가이자 식품 산업 컨설턴트입니다. 
이 음식 이미지를 분석하고 다음 정보를 JSON 형식으로 제공해주세요:

1. predictedDish: 예측된 요리 이름
2. confidence: 예측 신뢰도 (0-1)
3. ingredients: 예상 재료 목록 (각 재료별 name, amount, unitCost, totalCost 포함)
4. estimatedCost: 예상 원가 (ingredients, labor, packaging, overhead, total)
5. suggestedPrice: 권장 판매가 (min, optimal, max)
6. marginRate: 예상 마진율 (0-1)
7. processSteps: 공정 단계 (각 단계별 step, name, duration, equipment 배열)
8. optimizations: 원가 절감 및 품질 개선 제안 (문자열 배열)
9. riskFactors: 상품화 시 리스크 요인 (문자열 배열)

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: analysisPrompt,
            },
          ],
        },
      ],
    });

    // Claude 응답 파싱
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('분석 결과를 받지 못했습니다');
    }

    let analysisResult;
    try {
      // JSON 추출 (코드 블록 제거)
      let jsonText = textContent.text;
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      analysisResult = JSON.parse(jsonText);
    } catch {
      // 파싱 실패 시 기본값 반환
      analysisResult = {
        predictedDish: '분석 중 오류',
        confidence: 0.5,
        ingredients: [],
        estimatedCost: { ingredients: 0, labor: 0, packaging: 0, overhead: 0, total: 0 },
        suggestedPrice: { min: 0, optimal: 0, max: 0 },
        marginRate: 0,
        processSteps: [],
        optimizations: [],
        riskFactors: ['분석 결과를 파싱할 수 없습니다'],
      };
    }

    // RMR 데이터베이스에서 유사 레시피 매칭
    const keywords = analysisResult.predictedDish?.toLowerCase().split(' ') || [];
    const matchedRecipes = recipeDatabase
      .map((recipe) => {
        const matchCount = recipe.keywords.filter((kw) =>
          keywords.some((k: string) => kw.includes(k) || k.includes(kw))
        ).length;
        return {
          id: recipe.id,
          name: recipe.name,
          category: recipe.category,
          similarity: matchCount / recipe.keywords.length,
        };
      })
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        matchedRecipes,
      },
    });
  } catch (error) {
    console.error('Recipe analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Recipe Analysis API',
    endpoints: {
      'POST /api/analyze': '이미지 업로드로 레시피 분석',
    },
  });
}
