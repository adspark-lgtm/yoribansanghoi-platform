// ============================================
// MCP (Model Context Protocol) 컨텍스트 매니저
// ============================================
// AI 대화의 컨텍스트를 효율적으로 관리하고 지속성 제공

import { nanoid } from 'nanoid';
import type { 
  MCPContext, 
  ConversationMessage, 
  UserPreferences,
  Recipe,
  Factory 
} from '@/types';

// ============================================
// MCP 세션 매니저
// ============================================
class MCPSessionManager {
  private sessions: Map<string, MCPContext> = new Map();
  private readonly maxMessageHistory = 50;
  private readonly sessionTimeout = 30 * 60 * 1000; // 30분

  // 새 세션 생성
  createSession(userId?: string): MCPContext {
    const sessionId = `mcp-${nanoid(16)}`;
    
    const context: MCPContext = {
      sessionId,
      userId,
      currentRecipe: undefined,
      currentFactory: undefined,
      conversationHistory: [],
      preferences: {
        preferredRegion: undefined,
        budgetRange: undefined,
        priorityFactors: ['quality', 'cost'],
      },
    };

    this.sessions.set(sessionId, context);
    this.scheduleCleanup(sessionId);
    
    return context;
  }

  // 세션 조회
  getSession(sessionId: string): MCPContext | null {
    return this.sessions.get(sessionId) || null;
  }

  // 세션 업데이트
  updateSession(sessionId: string, updates: Partial<MCPContext>): MCPContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    
    return updatedSession;
  }

  // 메시지 추가
  addMessage(
    sessionId: string, 
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, unknown>
  ): MCPContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // 히스토리 크기 제한
    const history = [...session.conversationHistory, message];
    if (history.length > this.maxMessageHistory) {
      history.splice(0, history.length - this.maxMessageHistory);
    }

    session.conversationHistory = history;
    this.sessions.set(sessionId, session);
    
    return session;
  }

  // 현재 레시피 설정
  setCurrentRecipe(sessionId: string, recipe: Recipe): MCPContext | null {
    return this.updateSession(sessionId, { currentRecipe: recipe });
  }

  // 현재 공장 설정
  setCurrentFactory(sessionId: string, factory: Factory): MCPContext | null {
    return this.updateSession(sessionId, { currentFactory: factory });
  }

  // 사용자 선호도 업데이트
  updatePreferences(
    sessionId: string, 
    preferences: Partial<UserPreferences>
  ): MCPContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.preferences = { ...session.preferences, ...preferences };
    this.sessions.set(sessionId, session);
    
    return session;
  }

  // 세션 삭제
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // 세션 정리 스케줄링
  private scheduleCleanup(sessionId: string): void {
    setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session) {
        // 마지막 메시지가 오래됐으면 삭제
        const lastMessage = session.conversationHistory[session.conversationHistory.length - 1];
        if (lastMessage) {
          const lastTimestamp = new Date(lastMessage.timestamp).getTime();
          if (Date.now() - lastTimestamp > this.sessionTimeout) {
            this.deleteSession(sessionId);
          } else {
            // 다시 스케줄링
            this.scheduleCleanup(sessionId);
          }
        }
      }
    }, this.sessionTimeout);
  }
}

// ============================================
// MCP 프롬프트 빌더
// ============================================
class MCPPromptBuilder {
  // 시스템 프롬프트 생성
  buildSystemPrompt(context: MCPContext): string {
    let prompt = `당신은 요리반상회의 AI 푸드 전문 어시스턴트입니다.

## 역할
- 아날로그 푸드 IP(레시피)를 디지털 트윈으로 변환하는 AX(AI Transformation) 전문가
- 700개 이상의 RMR 레시피 DB와 50개 이상의 제조 공장 네트워크를 기반으로 최적의 솔루션 제공
- 김왕민 소장의 RMR 개발 노하우와 박찬일 셰프의 조리 전문성을 데이터로 학습

## 핵심 역량
1. **레시피 디지털화**: 음식 사진/설명 → 표준 공정 배합비 자동 생성
2. **스마트 공장 매칭**: 레시피 요구사항에 맞는 최적 제조 파트너 추천
3. **수익 최적화**: 원가 분석, 마진율 계산, 가격 전략 제안
4. **출시 로드맵**: 50일 내 상품 출시를 위한 단계별 가이드

## 대화 원칙
- 친근하고 전문적인 톤 유지
- 구체적인 수치와 데이터 기반 조언
- 질문을 통해 요구사항 명확화
- 실행 가능한 다음 단계 제안
`;

    // 현재 컨텍스트 추가
    if (context.currentRecipe) {
      prompt += `\n## 현재 작업 중인 레시피
- 이름: ${context.currentRecipe.name}
- 카테고리: ${context.currentRecipe.category}
- 예상 원가: ${context.currentRecipe.baseCost?.toLocaleString()}원
- 상태: ${context.currentRecipe.status}
`;
    }

    if (context.currentFactory) {
      prompt += `\n## 선택된 공장
- 이름: ${context.currentFactory.name}
- 지역: ${context.currentFactory.location?.region}
- 인증: ${context.currentFactory.certifications?.join(', ')}
`;
    }

    if (context.preferences) {
      const prefs = context.preferences;
      prompt += `\n## 사용자 선호도
- 선호 지역: ${prefs.preferredRegion || '미지정'}
- 예산 범위: ${prefs.budgetRange ? `${prefs.budgetRange.min.toLocaleString()}~${prefs.budgetRange.max.toLocaleString()}원` : '미지정'}
- 우선순위: ${prefs.priorityFactors?.join(', ') || '미지정'}
`;
    }

    return prompt;
  }

  // 대화 히스토리를 Claude API 형식으로 변환
  buildMessages(context: MCPContext): { role: string; content: string }[] {
    return context.conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  // 컨텍스트 요약 생성 (긴 대화 압축용)
  summarizeContext(context: MCPContext): string {
    const history = context.conversationHistory;
    if (history.length < 10) {
      return ''; // 요약 불필요
    }

    // 최근 5개 메시지만 유지, 나머지는 요약
    const recentMessages = history.slice(-5);
    const olderMessages = history.slice(0, -5);

    const summary = `[이전 대화 요약]
- 총 ${olderMessages.length}개의 메시지 교환
- 주요 주제: ${this.extractTopics(olderMessages)}
- 결정 사항: ${this.extractDecisions(olderMessages)}
`;

    return summary;
  }

  // 주제 추출 (간단한 휴리스틱)
  private extractTopics(messages: ConversationMessage[]): string {
    const keywords = new Set<string>();
    const topicKeywords = ['레시피', '공장', '비용', '생산', '매칭', '상담', '브랜드', '메뉴'];
    
    messages.forEach(msg => {
      topicKeywords.forEach(keyword => {
        if (msg.content.includes(keyword)) {
          keywords.add(keyword);
        }
      });
    });

    return Array.from(keywords).slice(0, 5).join(', ') || '일반 문의';
  }

  // 결정 사항 추출
  private extractDecisions(messages: ConversationMessage[]): string {
    // 간단한 휴리스틱: "선택", "결정", "확정" 등의 키워드 포함 메시지 찾기
    const decisionKeywords = ['선택', '결정', '확정', '진행', '계약'];
    const decisions: string[] = [];

    messages.forEach(msg => {
      if (msg.role === 'assistant') {
        decisionKeywords.forEach(keyword => {
          if (msg.content.includes(keyword)) {
            // 해당 문장만 추출 (간단 버전)
            const sentences = msg.content.split(/[.!?]/);
            sentences.forEach(s => {
              if (s.includes(keyword) && s.length < 100) {
                decisions.push(s.trim());
              }
            });
          }
        });
      }
    });

    return decisions.slice(0, 3).join('; ') || '없음';
  }
}

// ============================================
// MCP 도구 정의 (Claude Tools)
// ============================================
const MCPTools = [
  {
    name: 'analyze_recipe_image',
    description: '음식 이미지를 분석하여 레시피 디지털 트윈을 생성합니다.',
    input_schema: {
      type: 'object',
      properties: {
        image_url: {
          type: 'string',
          description: '분석할 음식 이미지 URL',
        },
        additional_info: {
          type: 'string',
          description: '추가 정보 (음식명, 특징 등)',
        },
      },
      required: ['image_url'],
    },
  },
  {
    name: 'search_recipes',
    description: '요리반상회 레시피 DB에서 레시피를 검색합니다.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '검색어 (레시피명, 재료, 카테고리 등)',
        },
        category: {
          type: 'string',
          enum: ['ramen', 'soup', 'noodle', 'rice', 'side', 'sauce', 'topping'],
          description: '레시피 카테고리',
        },
        limit: {
          type: 'number',
          description: '최대 결과 수 (기본: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'match_factory',
    description: '레시피 요구사항에 맞는 최적의 제조 공장을 매칭합니다.',
    input_schema: {
      type: 'object',
      properties: {
        recipe_category: {
          type: 'string',
          description: '레시피 카테고리',
        },
        monthly_quantity: {
          type: 'number',
          description: '월 예상 생산량',
        },
        budget: {
          type: 'number',
          description: '예산 (원)',
        },
        preferred_region: {
          type: 'string',
          description: '선호 지역',
        },
        required_certifications: {
          type: 'array',
          items: { type: 'string' },
          description: '필수 인증 (HACCP, ISO22000 등)',
        },
      },
      required: ['recipe_category', 'monthly_quantity'],
    },
  },
  {
    name: 'calculate_margin',
    description: '원가와 판매가를 기반으로 마진율을 계산합니다.',
    input_schema: {
      type: 'object',
      properties: {
        cost: {
          type: 'number',
          description: '원가 (원)',
        },
        selling_price: {
          type: 'number',
          description: '판매가 (원)',
        },
        quantity: {
          type: 'number',
          description: '수량',
        },
      },
      required: ['cost', 'selling_price'],
    },
  },
  {
    name: 'create_consultation',
    description: '상담 신청을 생성합니다.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '신청자 이름',
        },
        phone: {
          type: 'string',
          description: '연락처',
        },
        company: {
          type: 'string',
          description: '회사명',
        },
        project_type: {
          type: 'string',
          enum: ['rmr_development', 'recipe_digitization', 'factory_matching', 'brand_consulting', 'menu_optimization', 'other'],
          description: '프로젝트 유형',
        },
        description: {
          type: 'string',
          description: '상담 내용',
        },
      },
      required: ['name', 'phone', 'project_type'],
    },
  },
  {
    name: 'get_launch_roadmap',
    description: '레시피 상품 출시를 위한 로드맵을 생성합니다.',
    input_schema: {
      type: 'object',
      properties: {
        recipe_id: {
          type: 'string',
          description: '레시피 ID',
        },
        target_launch_date: {
          type: 'string',
          description: '목표 출시일 (YYYY-MM-DD)',
        },
        urgency: {
          type: 'string',
          enum: ['normal', 'urgent', 'flexible'],
          description: '긴급도',
        },
      },
      required: ['recipe_id'],
    },
  },
];

// ============================================
// 싱글톤 인스턴스 내보내기
// ============================================
export const mcpSessionManager = new MCPSessionManager();
export const mcpPromptBuilder = new MCPPromptBuilder();
export { MCPTools };

// React Hook for MCP
export function useMCPContext() {
  // 클라이언트 사이드에서 세션 관리
  const getOrCreateSession = (userId?: string) => {
    if (typeof window === 'undefined') return null;
    
    const storedSessionId = sessionStorage.getItem('mcp_session_id');
    if (storedSessionId) {
      const session = mcpSessionManager.getSession(storedSessionId);
      if (session) return session;
    }
    
    const newSession = mcpSessionManager.createSession(userId);
    sessionStorage.setItem('mcp_session_id', newSession.sessionId);
    return newSession;
  };

  return {
    getOrCreateSession,
    addMessage: mcpSessionManager.addMessage.bind(mcpSessionManager),
    updatePreferences: mcpSessionManager.updatePreferences.bind(mcpSessionManager),
    setCurrentRecipe: mcpSessionManager.setCurrentRecipe.bind(mcpSessionManager),
    setCurrentFactory: mcpSessionManager.setCurrentFactory.bind(mcpSessionManager),
    buildSystemPrompt: mcpPromptBuilder.buildSystemPrompt.bind(mcpPromptBuilder),
    buildMessages: mcpPromptBuilder.buildMessages.bind(mcpPromptBuilder),
  };
}

export default {
  sessionManager: mcpSessionManager,
  promptBuilder: mcpPromptBuilder,
  tools: MCPTools,
};
