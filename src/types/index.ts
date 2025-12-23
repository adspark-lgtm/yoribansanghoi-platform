// ============================================
// 요리반상회 AX 플랫폼 타입 정의
// ============================================

// ============================================
// 레시피 관련 타입
// ============================================
export interface Recipe {
  id: string;
  name: string;
  koreanName: string;
  category: RecipeCategory;
  description: string;
  imageUrl?: string;
  
  // 원가 정보
  baseCost: number;
  sellingPrice: number;
  marginRate: number;
  
  // 공정 정보
  processSteps: ProcessStep[];
  ingredients: Ingredient[];
  
  // 메타데이터
  developedBy: string;           // 개발자 (예: 김왕민 소장)
  originalSource?: string;       // 원본 출처 (예: 용문해장국 60년 레시피)
  rmrCode?: string;             // RMR 코드
  
  // AI 분석 결과
  aiAnalysis?: AIRecipeAnalysis;
  
  // 상태
  status: RecipeStatus;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory = 
  | 'ramen'      // 라멘류
  | 'soup'       // 탕/찌개류
  | 'noodle'     // 면류
  | 'rice'       // 밥류
  | 'side'       // 반찬류
  | 'sauce'      // 소스류
  | 'topping';   // 토핑류

export type RecipeStatus = 
  | 'draft'           // 초안
  | 'analyzing'       // AI 분석 중
  | 'reviewed'        // 검토 완료
  | 'production'      // 생산 가능
  | 'archived';       // 보관

export interface ProcessStep {
  order: number;
  name: string;
  description: string;
  duration: number;           // 분 단위
  temperature?: number;       // 온도 (섭씨)
  equipment?: string[];       // 필요 장비
  tips?: string;             // 조리 팁
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  cost: number;
  supplier?: string;
  isOptional: boolean;
}

export interface AIRecipeAnalysis {
  confidence: number;         // 0-100
  matchedRecipes: MatchedRecipe[];
  suggestedOptimizations: string[];
  nutritionFacts?: NutritionFacts;
  allergens: string[];
  shelfLife: number;          // 일 단위
  storageConditions: string;
  analyzedAt: string;
}

export interface MatchedRecipe {
  recipeId: string;
  recipeName: string;
  similarity: number;         // 0-100
  matchReason: string;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  sodium: number;
  fiber?: number;
}

// ============================================
// 공장 관련 타입
// ============================================
export interface Factory {
  id: string;
  name: string;
  location: FactoryLocation;
  
  // 설비 정보
  equipment: Equipment[];
  certifications: string[];    // HACCP, ISO 등
  
  // 생산 능력
  capacity: ProductionCapacity;
  moq: number;                 // 최소 주문 수량
  leadTime: number;            // 리드타임 (일)
  
  // 비용
  baseCostPerUnit: number;
  setupFee?: number;
  
  // 연락처
  contact: FactoryContact;
  
  // 평가
  rating: number;              // 1-5
  reviews: FactoryReview[];
  successfulProjects: number;
  
  // 상태
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FactoryLocation {
  region: string;              // 시/도
  city: string;                // 시/군/구
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Equipment {
  type: EquipmentType;
  model?: string;
  capacity?: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export type EquipmentType = 
  | 'mixer'           // 믹서
  | 'cooker'          // 조리기
  | 'fryer'           // 튀김기
  | 'packaging'       // 포장기
  | 'freezer'         // 냉동기
  | 'pasteurizer'     // 살균기
  | 'filling'         // 충진기
  | 'labeling'        // 라벨링
  | 'sterilizer'      // 멸균기
  | 'other';

export interface ProductionCapacity {
  daily: number;               // 일일 생산량
  monthly: number;             // 월간 생산량
  unit: string;                // 단위 (예: kg, 개, 팩)
}

export interface FactoryContact {
  name: string;
  phone: string;
  email?: string;
  position?: string;
}

export interface FactoryReview {
  id: string;
  rating: number;
  comment: string;
  projectType: string;
  reviewerName: string;
  createdAt: string;
}

// ============================================
// 공장 매칭 관련 타입
// ============================================
export interface FactoryMatchRequest {
  recipeId?: string;
  category: RecipeCategory;
  monthlyQuantity: number;
  budget?: number;
  requiredEquipment?: EquipmentType[];
  requiredCertifications?: string[];
  preferredRegion?: string;
  deliveryDeadline?: string;
}

export interface FactoryMatchResult {
  factory: Factory;
  matchScore: number;          // 0-100
  estimatedCost: number;
  estimatedLeadTime: number;
  matchReasons: string[];
  warnings?: string[];
}

// ============================================
// 상담 관련 타입
// ============================================
export interface Consultation {
  id: string;
  
  // 신청자 정보
  applicant: ApplicantInfo;
  
  // 상담 내용
  projectType: ProjectType;
  description: string;
  budget?: number;
  timeline?: string;
  
  // 첨부파일
  attachments?: Attachment[];
  
  // 상담 상태
  status: ConsultationStatus;
  assignedTo?: string;
  
  // 히스토리
  notes: ConsultationNote[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ApplicantInfo {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  position?: string;
}

export type ProjectType = 
  | 'rmr_development'     // RMR 상품 개발
  | 'recipe_digitization' // 레시피 디지털화
  | 'factory_matching'    // 공장 매칭
  | 'brand_consulting'    // 브랜드 컨설팅
  | 'menu_optimization'   // 메뉴 최적화
  | 'other';

export type ConsultationStatus = 
  | 'pending'         // 대기
  | 'contacted'       // 연락 완료
  | 'in_progress'     // 진행 중
  | 'proposal_sent'   // 제안서 발송
  | 'negotiating'     // 협상 중
  | 'contracted'      // 계약 완료
  | 'completed'       // 완료
  | 'cancelled';      // 취소

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ConsultationNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// 토핑 관련 타입 (멘야서울)
// ============================================
export interface Topping {
  id: string;
  name: string;
  category: ToppingCategory;
  
  // 원가
  cost: number;
  
  // 추천 조합
  recommendedWith: string[];    // 다른 토핑 ID
  
  // 마진
  addedPrice: number;           // 추가 판매가
  
  // 재고
  isAvailable: boolean;
  stockLevel?: 'low' | 'medium' | 'high';
}

export type ToppingCategory = 
  | 'meat'        // 고기류 (동파육, 잠봉, 양갈비)
  | 'egg'         // 계란류
  | 'vegetable'   // 채소류
  | 'noodle'      // 면 추가
  | 'other';

export interface ToppingCombination {
  toppings: Topping[];
  totalCost: number;
  totalAddedPrice: number;
  marginRate: number;
  isRecommended: boolean;
  recommendationType?: 'premium' | 'value' | 'popular';
}

// ============================================
// 분석/통계 관련 타입
// ============================================
export interface DashboardStats {
  totalRecipes: number;
  activeAnalyses: number;
  matchingSuccessRate: number;
  averageLaunchDays: number;
  monthlyConsultations: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'recipe_uploaded' | 'factory_matched' | 'consultation_created' | 'analysis_completed';
  description: string;
  timestamp: string;
  userId?: string;
}

// ============================================
// API 응답 타입
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// MCP 컨텍스트 타입
// ============================================
export interface MCPContext {
  sessionId: string;
  userId?: string;
  currentRecipe?: Recipe;
  currentFactory?: Factory;
  conversationHistory: ConversationMessage[];
  preferences: UserPreferences;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  preferredRegion?: string;
  budgetRange?: { min: number; max: number };
  priorityFactors?: ('cost' | 'quality' | 'speed' | 'certification')[];
}
