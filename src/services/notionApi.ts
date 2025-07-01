import type { NotionQueryResponse, SalesData } from '../types/notion';

class NotionApiService {
  private apiKey: string;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.apiKey = apiKey;
    this.databaseId = databaseId;
  }

  async queryDatabase(): Promise<NotionQueryResponse> {
    try {
      console.log('API 요청 시작:', {
        databaseId: this.databaseId,
        apiKey: '***' // 보안상 숨김
      });

      const response = await fetch(`/api/notion/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // API 응답 디버깅을 위한 로그
      console.log('노션 API 응답:', JSON.stringify(data, null, 2));
      
      return data as NotionQueryResponse;
    } catch (error) {
      console.error('노션 데이터베이스 쿼리 오류:', error);
      throw error;
    }
  }

  async getDatabaseInfo() {
    try {
      const response = await fetch(`/api/notion/v1/databases/${this.databaseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('데이터베이스 정보 조회 오류:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('노션 데이터베이스 정보 조회 오류:', error);
      throw error;
    }
  }

  parseSalesData(pages: any[]): SalesData[] {
    console.log('파싱할 페이지 데이터:', JSON.stringify(pages, null, 2));
    
    if (pages.length === 0) {
      console.log('페이지가 없습니다.');
      return [];
    }

    // 첫 번째 페이지의 속성 구조를 분석
    const firstPage = pages[0];
    const properties = firstPage.properties;
    console.log('첫 번째 페이지 속성 구조:', Object.keys(properties));
    
    // 각 속성의 타입과 이름을 출력
    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      console.log(`속성: ${key}, 타입: ${value?.type}, 값:`, value);
    });
    
    return pages.map(page => {
      const properties = page.properties;
      
      // 실제 데이터 구조에 맞게 파싱
      const parsedData = {
        id: page.id,
        customer: this.extractTextValue(properties, 'Name') || this.extractTextValue(properties, 'Title') || 'Unknown',
        status: this.extractSelectValue(properties, '상태') || this.extractSelectValue(properties, 'Status') || 'Unknown',
        visitCount: this.extractSelectValue(properties, '방문차수') || this.extractSelectValue(properties, 'Visit Count') || 'Unknown',
        lastVisitDate: this.extractDateValue(properties, '최종방문일자') || this.extractDateValue(properties, 'Last Visit Date') || '',
        reaction: this.extractSelectValue(properties, '반응') || this.extractSelectValue(properties, 'Reaction') || 'Unknown',
        salesStage: this.extractSelectValue(properties, '세일즈단계') || this.extractSelectValue(properties, 'Sales Stage') || 'Unknown',
        amount: this.extractNumberValue(properties, 'Amount') || this.extractNumberValue(properties, 'Price') || 0,
        date: this.extractDateValue(properties, 'Date') || this.extractDateValue(properties, 'Created') || '',
      };
      
      console.log('파싱된 데이터:', parsedData);
      return parsedData;
    });
  }

  private extractTextValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
    if (prop?.type === 'rich_text' && prop.rich_text?.[0]?.plain_text) {
      return prop.rich_text[0].plain_text;
    }
    return null;
  }

  private extractSelectValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'select' && prop.select?.name) {
      return prop.select.name;
    }
    return null;
  }

  private extractNumberValue(properties: any, propertyName: string): number | null {
    const prop = properties[propertyName];
    if (prop?.type === 'number' && prop.number !== null) {
      return prop.number;
    }
    return null;
  }

  private extractDateValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'date' && prop.date?.start) {
      return prop.date.start;
    }
    return null;
  }

  private findPropertiesByType(properties: any, type: string): any[] {
    const foundProps: any[] = [];
    for (const [key, value] of Object.entries(properties)) {
      if (value && typeof value === 'object' && 'type' in value && (value as any).type === type) {
        foundProps.push(value);
      }
    }
    return foundProps;
  }

  private findPropertyByType(properties: any, type: string): any {
    const props = this.findPropertiesByType(properties, type);
    return props.length > 0 ? props[0] : null;
  }
}

export default NotionApiService; 