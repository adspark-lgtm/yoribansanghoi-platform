import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 임시 저장소 (실제로는 DynamoDB 사용)
const consultations: Map<string, ConsultationData> = new Map();

interface ConsultationData {
  id: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 유효성 검사
function validateConsultation(data: Partial<ConsultationData>): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2) {
    errors.push('이름은 2자 이상이어야 합니다');
  }

  if (!data.phone || !/^[0-9-]{10,13}$/.test(data.phone.replace(/-/g, ''))) {
    errors.push('올바른 연락처를 입력해주세요');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('올바른 이메일을 입력해주세요');
  }

  if (!data.projectType) {
    errors.push('프로젝트 유형을 선택해주세요');
  }

  return errors;
}

// Slack 알림 전송
async function sendSlackNotification(consultation: ConsultationData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const projectTypeLabels: Record<string, string> = {
    new_product: '신제품 개발',
    recipe_commercialize: '레시피 상품화',
    oem_matching: 'OEM 공장 매칭',
    cost_optimization: '원가 최적화',
    brand_launch: '브랜드 론칭',
    consulting: '사업 컨설팅',
  };

  const budgetLabels: Record<string, string> = {
    under_10m: '1천만원 미만',
    '10m_30m': '1천만원 ~ 3천만원',
    '30m_50m': '3천만원 ~ 5천만원',
    '50m_100m': '5천만원 ~ 1억원',
    over_100m: '1억원 이상',
    undecided: '미정',
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🔔 새로운 상담 신청',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*신청자:*\n${consultation.name}` },
              { type: 'mrkdwn', text: `*회사:*\n${consultation.company || '-'}` },
              { type: 'mrkdwn', text: `*연락처:*\n${consultation.phone}` },
              { type: 'mrkdwn', text: `*이메일:*\n${consultation.email}` },
              { type: 'mrkdwn', text: `*프로젝트:*\n${projectTypeLabels[consultation.projectType] || consultation.projectType}` },
              { type: 'mrkdwn', text: `*카테고리:*\n${consultation.category}` },
              { type: 'mrkdwn', text: `*예산:*\n${budgetLabels[consultation.budget] || consultation.budget}` },
              { type: 'mrkdwn', text: `*일정:*\n${consultation.timeline}` },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*상세 내용:*\n${consultation.description || '(없음)'}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `📅 ${new Date(consultation.createdAt).toLocaleString('ko-KR')} | ID: ${consultation.id}`,
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Slack notification error:', error);
  }
}

// SMS 알림 전송 (알리고 API)
async function sendSmsNotification(consultation: ConsultationData) {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const sender = process.env.ALIGO_SENDER;
  const receiver = process.env.ADMIN_PHONE;

  if (!apiKey || !userId || !sender || !receiver) return;

  const message = `[요리반상회] 새 상담 신청
이름: ${consultation.name}
유형: ${consultation.projectType}
연락처: ${consultation.phone}`;

  try {
    const params = new URLSearchParams({
      key: apiKey,
      userid: userId,
      sender,
      receiver,
      msg: message,
    });

    await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      body: params,
    });
  } catch (error) {
    console.error('SMS notification error:', error);
  }
}

// GET: 상담 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let results = Array.from(consultations.values());

  // 상태 필터
  if (status) {
    results = results.filter((c) => c.status === status);
  }

  // 최신순 정렬
  results.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 페이지네이션
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: {
      items: results,
      total,
      limit,
      offset,
    },
  });
}

// POST: 상담 신청
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유효성 검사
    const errors = validateConsultation(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // 상담 데이터 생성
    const consultation: ConsultationData = {
      id: uuidv4(),
      name: body.name,
      company: body.company || '',
      phone: body.phone,
      email: body.email,
      projectType: body.projectType,
      category: body.category || '',
      budget: body.budget || '',
      timeline: body.timeline || '',
      description: body.description || '',
      hasRecipe: body.hasRecipe || false,
      hasFactory: body.hasFactory || false,
      marketingPlan: body.marketingPlan || '',
      referralSource: body.referralSource || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 저장
    consultations.set(consultation.id, consultation);

    // 알림 전송 (비동기)
    Promise.all([
      sendSlackNotification(consultation),
      sendSmsNotification(consultation),
    ]).catch(console.error);

    return NextResponse.json({
      success: true,
      data: consultation,
      message: '상담 신청이 완료되었습니다',
    });
  } catch (error) {
    console.error('Consultation creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '상담 신청 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}

// PUT: 상담 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '상담 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const consultation = consultations.get(id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: '상담을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 업데이트
    const updated: ConsultationData = {
      ...consultation,
      status: status || consultation.status,
      description: notes ? `${consultation.description}\n\n[메모] ${notes}` : consultation.description,
      updatedAt: new Date().toISOString(),
    };

    consultations.set(id, updated);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Consultation update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '상담 업데이트 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}

// DELETE: 상담 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '상담 ID가 필요합니다' },
        { status: 400 }
      );
    }

    if (!consultations.has(id)) {
      return NextResponse.json(
        { success: false, error: '상담을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    consultations.delete(id);

    return NextResponse.json({
      success: true,
      message: '상담이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Consultation deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '상담 삭제 중 오류가 발생했습니다' 
      },
      { status: 500 }
    );
  }
}
