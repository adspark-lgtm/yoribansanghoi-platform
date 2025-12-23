// ============================================
// Lambda: 상담 관리 API
// ============================================
// 상담 신청 CRUD + 알림 연동

import { nanoid } from 'nanoid';

// 상담 데이터 (실제로는 DynamoDB 사용)
let consultationsStore: any[] = [];

// Lambda 핸들러
export const handler = async (event: any) => {
  console.log('Consultation API triggered:', JSON.stringify(event));

  const { httpMethod, path, body, pathParameters, queryStringParameters } = event;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    // 라우팅
    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.id) {
          return getConsultation(pathParameters.id);
        }
        return listConsultations(queryStringParameters);

      case 'POST':
        return createConsultation(parsedBody);

      case 'PUT':
        if (!pathParameters?.id) {
          return errorResponse(400, 'MISSING_ID', '상담 ID가 필요합니다.');
        }
        return updateConsultation(pathParameters.id, parsedBody);

      case 'DELETE':
        if (!pathParameters?.id) {
          return errorResponse(400, 'MISSING_ID', '상담 ID가 필요합니다.');
        }
        return deleteConsultation(pathParameters.id);

      case 'OPTIONS':
        return { statusCode: 200, headers: corsHeaders(), body: '' };

      default:
        return errorResponse(405, 'METHOD_NOT_ALLOWED', '허용되지 않는 메서드입니다.');
    }
  } catch (error: any) {
    console.error('Consultation API error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', error.message);
  }
};

// ============================================
// CRUD 함수들
// ============================================

// 상담 생성
async function createConsultation(data: any) {
  // 유효성 검사
  const validation = validateConsultationData(data);
  if (!validation.valid) {
    return errorResponse(400, 'VALIDATION_ERROR', validation.message);
  }

  const consultation = {
    id: `consult-${nanoid(10)}`,
    
    // 신청자 정보
    applicant: {
      name: data.name,
      company: data.company || null,
      phone: formatPhoneNumber(data.phone),
      email: data.email || null,
      position: data.position || null,
    },

    // 프로젝트 정보
    projectType: data.projectType || 'rmr_development',
    description: data.description || '',
    budget: data.budget || null,
    timeline: data.timeline || null,

    // 추가 정보
    referralSource: data.referralSource || null, // 유입 경로
    preferredContactTime: data.preferredContactTime || null,

    // 상태
    status: 'pending',
    assignedTo: null,
    notes: [],

    // 타임스탬프
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 저장 (실제로는 DynamoDB)
  consultationsStore.push(consultation);

  // 알림 발송 (Slack, SMS 등)
  await sendNotifications(consultation);

  return {
    statusCode: 201,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data: consultation,
      message: '상담 신청이 완료되었습니다. 영업일 기준 1일 이내 연락드리겠습니다.',
    }),
  };
}

// 상담 조회 (단일)
async function getConsultation(id: string) {
  const consultation = consultationsStore.find(c => c.id === id);
  
  if (!consultation) {
    return errorResponse(404, 'NOT_FOUND', '상담 정보를 찾을 수 없습니다.');
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data: consultation,
    }),
  };
}

// 상담 목록 조회
async function listConsultations(query: any = {}) {
  let results = [...consultationsStore];

  // 상태 필터
  if (query?.status) {
    results = results.filter(c => c.status === query.status);
  }

  // 프로젝트 타입 필터
  if (query?.projectType) {
    results = results.filter(c => c.projectType === query.projectType);
  }

  // 정렬 (최신순)
  results.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 페이지네이션
  const page = parseInt(query?.page || '1');
  const limit = parseInt(query?.limit || '20');
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data: paginatedResults,
      meta: {
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
      },
    }),
  };
}

// 상담 업데이트
async function updateConsultation(id: string, updates: any) {
  const index = consultationsStore.findIndex(c => c.id === id);
  
  if (index === -1) {
    return errorResponse(404, 'NOT_FOUND', '상담 정보를 찾을 수 없습니다.');
  }

  const consultation = consultationsStore[index];

  // 업데이트 가능한 필드
  const allowedUpdates = ['status', 'assignedTo', 'notes', 'description', 'budget', 'timeline'];
  
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      if (field === 'notes' && updates.addNote) {
        // 노트 추가
        consultation.notes = [
          ...consultation.notes,
          {
            id: `note-${nanoid(8)}`,
            content: updates.addNote,
            createdBy: updates.createdBy || 'system',
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        consultation[field] = updates[field];
      }
    }
  });

  consultation.updatedAt = new Date().toISOString();
  consultationsStore[index] = consultation;

  // 상태 변경 시 알림
  if (updates.status && updates.status !== consultation.status) {
    await sendStatusUpdateNotification(consultation, updates.status);
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      data: consultation,
    }),
  };
}

// 상담 삭제
async function deleteConsultation(id: string) {
  const index = consultationsStore.findIndex(c => c.id === id);
  
  if (index === -1) {
    return errorResponse(404, 'NOT_FOUND', '상담 정보를 찾을 수 없습니다.');
  }

  consultationsStore.splice(index, 1);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: true,
      message: '상담이 삭제되었습니다.',
    }),
  };
}

// ============================================
// 유틸리티 함수
// ============================================

// 유효성 검사
function validateConsultationData(data: any) {
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, message: '이름을 입력해주세요 (2자 이상)' };
  }

  if (!data.phone || !isValidPhoneNumber(data.phone)) {
    return { valid: false, message: '올바른 연락처를 입력해주세요' };
  }

  if (data.email && !isValidEmail(data.email)) {
    return { valid: false, message: '올바른 이메일 주소를 입력해주세요' };
  }

  const validProjectTypes = [
    'rmr_development',
    'recipe_digitization',
    'factory_matching',
    'brand_consulting',
    'menu_optimization',
    'other',
  ];
  if (data.projectType && !validProjectTypes.includes(data.projectType)) {
    return { valid: false, message: '올바른 프로젝트 유형을 선택해주세요' };
  }

  return { valid: true, message: '' };
}

// 전화번호 유효성 검사
function isValidPhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

// 전화번호 포맷팅
function formatPhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// 이메일 유효성 검사
function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// 알림 함수
// ============================================

// 새 상담 알림
async function sendNotifications(consultation: any) {
  // Slack 웹훅 알림
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🆕 새 상담 신청`,
          attachments: [{
            color: '#C41E3A',
            fields: [
              { title: '신청자', value: consultation.applicant.name, short: true },
              { title: '연락처', value: consultation.applicant.phone, short: true },
              { title: '회사', value: consultation.applicant.company || '-', short: true },
              { title: '프로젝트', value: getProjectTypeName(consultation.projectType), short: true },
              { title: '내용', value: consultation.description || '-' },
            ],
            footer: `상담 ID: ${consultation.id}`,
            ts: Math.floor(Date.now() / 1000),
          }],
        }),
      });
    } catch (error) {
      console.error('Slack notification error:', error);
    }
  }

  // SMS 알림 (알리고 API)
  if (process.env.ALIGO_API_KEY) {
    try {
      // 담당자에게 SMS 발송
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        const formData = new URLSearchParams();
        formData.append('key', process.env.ALIGO_API_KEY);
        formData.append('user_id', process.env.ALIGO_USER_ID || '');
        formData.append('sender', process.env.ALIGO_SENDER || '');
        formData.append('receiver', adminPhone);
        formData.append('msg', 
          `[요리반상회] 새 상담 신청\n` +
          `신청자: ${consultation.applicant.name}\n` +
          `연락처: ${consultation.applicant.phone}\n` +
          `유형: ${getProjectTypeName(consultation.projectType)}`
        );

        await fetch('https://apis.aligo.in/send/', {
          method: 'POST',
          body: formData,
        });
      }
    } catch (error) {
      console.error('SMS notification error:', error);
    }
  }
}

// 상태 변경 알림
async function sendStatusUpdateNotification(consultation: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    contacted: '담당자가 연락 예정입니다.',
    in_progress: '프로젝트 진행이 시작되었습니다.',
    proposal_sent: '제안서가 발송되었습니다.',
    contracted: '계약이 완료되었습니다. 감사합니다!',
    completed: '프로젝트가 성공적으로 완료되었습니다.',
  };

  const message = statusMessages[newStatus];
  if (message && process.env.ALIGO_API_KEY) {
    try {
      const formData = new URLSearchParams();
      formData.append('key', process.env.ALIGO_API_KEY);
      formData.append('user_id', process.env.ALIGO_USER_ID || '');
      formData.append('sender', process.env.ALIGO_SENDER || '');
      formData.append('receiver', consultation.applicant.phone.replace(/-/g, ''));
      formData.append('msg', 
        `[요리반상회] 상담 진행 안내\n` +
        `${consultation.applicant.name}님, ${message}`
      );

      await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Status SMS notification error:', error);
    }
  }
}

// 프로젝트 타입 이름 변환
function getProjectTypeName(type: string) {
  const names: Record<string, string> = {
    rmr_development: 'RMR 상품 개발',
    recipe_digitization: '레시피 디지털화',
    factory_matching: '공장 매칭',
    brand_consulting: '브랜드 컨설팅',
    menu_optimization: '메뉴 최적화',
    other: '기타 문의',
  };
  return names[type] || type;
}

// 에러 응답 생성
function errorResponse(statusCode: number, code: string, message: string) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify({
      success: false,
      error: { code, message },
    }),
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
