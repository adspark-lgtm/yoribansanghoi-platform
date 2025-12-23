// ============================================
// DynamoDB 클라이언트 설정
// ============================================
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  QueryCommand, 
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined, // Lambda 환경에서는 IAM Role 사용
});

// Document Client (더 편리한 API)
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// 테이블명 상수
export const TABLES = {
  RECIPES: process.env.DYNAMODB_TABLE_RECIPES || 'yoribansanghoi-recipes',
  FACTORIES: process.env.DYNAMODB_TABLE_FACTORIES || 'yoribansanghoi-factories',
  CONSULTATIONS: process.env.DYNAMODB_TABLE_CONSULTATIONS || 'yoribansanghoi-consultations',
  USERS: process.env.DYNAMODB_TABLE_USERS || 'yoribansanghoi-users',
  ANALYTICS: process.env.DYNAMODB_TABLE_ANALYTICS || 'yoribansanghoi-analytics',
};

// ============================================
// 레시피 CRUD
// ============================================
export const recipeDB = {
  // 레시피 생성
  async create(recipe: any) {
    const command = new PutCommand({
      TableName: TABLES.RECIPES,
      Item: {
        ...recipe,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(id)',
    });
    await docClient.send(command);
    return recipe;
  },

  // 레시피 조회
  async getById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.RECIPES,
      Key: { id },
    });
    const result = await docClient.send(command);
    return result.Item;
  },

  // 카테고리별 레시피 조회
  async getByCategory(category: string, limit = 20) {
    const command = new QueryCommand({
      TableName: TABLES.RECIPES,
      IndexName: 'category-index',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category,
      },
      Limit: limit,
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // 전체 레시피 조회
  async getAll(limit = 100) {
    const command = new ScanCommand({
      TableName: TABLES.RECIPES,
      Limit: limit,
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // 레시피 업데이트
  async update(id: string, updates: any) {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // 항상 updatedAt 업데이트
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLES.RECIPES,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return result.Attributes;
  },

  // 레시피 삭제
  async delete(id: string) {
    const command = new DeleteCommand({
      TableName: TABLES.RECIPES,
      Key: { id },
    });
    await docClient.send(command);
    return { success: true };
  },

  // 레시피 검색 (이름으로)
  async search(query: string, limit = 20) {
    const command = new ScanCommand({
      TableName: TABLES.RECIPES,
      FilterExpression: 'contains(#name, :query) OR contains(koreanName, :query)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':query': query,
      },
      Limit: limit,
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },
};

// ============================================
// 공장 CRUD
// ============================================
export const factoryDB = {
  // 공장 생성
  async create(factory: any) {
    const command = new PutCommand({
      TableName: TABLES.FACTORIES,
      Item: {
        ...factory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    await docClient.send(command);
    return factory;
  },

  // 공장 조회
  async getById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.FACTORIES,
      Key: { id },
    });
    const result = await docClient.send(command);
    return result.Item;
  },

  // 지역별 공장 조회
  async getByRegion(region: string, limit = 20) {
    const command = new QueryCommand({
      TableName: TABLES.FACTORIES,
      IndexName: 'region-index',
      KeyConditionExpression: '#region = :region',
      ExpressionAttributeNames: {
        '#region': 'region',
      },
      ExpressionAttributeValues: {
        ':region': region,
      },
      Limit: limit,
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // 활성 공장 전체 조회
  async getAllActive() {
    const command = new ScanCommand({
      TableName: TABLES.FACTORIES,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: {
        ':active': true,
      },
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // 공장 매칭 (조건 기반)
  async findMatching(criteria: {
    equipment?: string[];
    certifications?: string[];
    minCapacity?: number;
    region?: string;
  }) {
    let filterExpressions: string[] = ['isActive = :active'];
    const expressionAttributeValues: Record<string, any> = {
      ':active': true,
    };

    if (criteria.region) {
      filterExpressions.push('#region = :region');
      expressionAttributeValues[':region'] = criteria.region;
    }

    const command = new ScanCommand({
      TableName: TABLES.FACTORIES,
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeNames: criteria.region ? { '#region': 'region' } : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await docClient.send(command);
    let factories = result.Items || [];

    // 추가 필터링 (JavaScript에서 처리)
    if (criteria.equipment?.length) {
      factories = factories.filter((f: any) =>
        criteria.equipment!.some(eq => 
          f.equipment?.some((e: any) => e.type === eq)
        )
      );
    }

    if (criteria.certifications?.length) {
      factories = factories.filter((f: any) =>
        criteria.certifications!.some(cert => 
          f.certifications?.includes(cert)
        )
      );
    }

    if (criteria.minCapacity) {
      factories = factories.filter((f: any) =>
        f.capacity?.monthly >= criteria.minCapacity
      );
    }

    return factories;
  },
};

// ============================================
// 상담 CRUD
// ============================================
export const consultationDB = {
  // 상담 생성
  async create(consultation: any) {
    const command = new PutCommand({
      TableName: TABLES.CONSULTATIONS,
      Item: {
        ...consultation,
        status: 'pending',
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    await docClient.send(command);
    return consultation;
  },

  // 상담 조회
  async getById(id: string) {
    const command = new GetCommand({
      TableName: TABLES.CONSULTATIONS,
      Key: { id },
    });
    const result = await docClient.send(command);
    return result.Item;
  },

  // 상태별 상담 조회
  async getByStatus(status: string, limit = 50) {
    const command = new QueryCommand({
      TableName: TABLES.CONSULTATIONS,
      IndexName: 'status-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      Limit: limit,
      ScanIndexForward: false, // 최신순
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // 상담 상태 업데이트
  async updateStatus(id: string, status: string, note?: string) {
    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (note) {
      // 노트 추가
      const existing = await this.getById(id);
      updates.notes = [
        ...(existing?.notes || []),
        {
          id: `note-${Date.now()}`,
          content: note,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    const command = new UpdateCommand({
      TableName: TABLES.CONSULTATIONS,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt' + 
        (note ? ', notes = :notes' : ''),
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': updates.updatedAt,
        ...(note ? { ':notes': updates.notes } : {}),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return result.Attributes;
  },

  // 최근 상담 조회
  async getRecent(limit = 20) {
    const command = new ScanCommand({
      TableName: TABLES.CONSULTATIONS,
      Limit: limit,
    });
    const result = await docClient.send(command);
    // createdAt으로 정렬
    return (result.Items || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};

// ============================================
// 분석 데이터 저장
// ============================================
export const analyticsDB = {
  // 이벤트 로깅
  async logEvent(event: {
    type: string;
    userId?: string;
    data: any;
  }) {
    const command = new PutCommand({
      TableName: TABLES.ANALYTICS,
      Item: {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...event,
        timestamp: new Date().toISOString(),
      },
    });
    await docClient.send(command);
  },

  // 일별 통계 조회
  async getDailyStats(date: string) {
    const command = new QueryCommand({
      TableName: TABLES.ANALYTICS,
      IndexName: 'date-index',
      KeyConditionExpression: '#date = :date',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':date': date,
      },
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },
};

export default {
  recipe: recipeDB,
  factory: factoryDB,
  consultation: consultationDB,
  analytics: analyticsDB,
};
