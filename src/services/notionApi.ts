import { Client } from '@notionhq/client';
import type { NotionQueryResponse, SalesData } from '../types/notion';

class NotionApiService {
  private client: Client;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.client = new Client({ auth: apiKey });
    this.databaseId = databaseId;
  }

  async queryDatabase(): Promise<NotionQueryResponse> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      });
      
      // API 응답 디버깅을 위한 로그
      console.log('노션 API 응답:', JSON.stringify(response, null, 2));
      
      return response as NotionQueryResponse;
    } catch (error) {
      console.error('노션 데이터베이스 쿼리 오류:', error);
      throw error;
    }
  }

  async getDatabaseInfo() {
    try {
      const response = await this.client.databases.retrieve({
        database_id: this.databaseId,
      });
      return response;
    } catch (error) {
      console.error('노션 데이터베이스 정보 조회 오류:', error);
      throw error;
    }
  }

  parseSalesData(pages: any[]): SalesData[] {
    console.log('파싱할 페이지 데이터:', JSON.stringify(pages, null, 2));
    
    return pages.map(page => {
      const properties = page.properties;
      console.log('페이지 속성:', JSON.stringify(properties, null, 2));
      
      // 속성 이름을 동적으로 찾기
      const customerProp = this.findPropertyByType(properties, 'title');
      const productProp = this.findPropertyByType(properties, 'select');
      const amountProp = this.findPropertyByType(properties, 'number');
      const dateProp = this.findPropertyByType(properties, 'date');
      const statusProp = this.findPropertyByType(properties, 'select');
      
      const parsedData = {
        id: page.id,
        customer: customerProp?.title?.[0]?.plain_text || 'Unknown',
        product: productProp?.select?.name || 'Unknown',
        amount: amountProp?.number || 0,
        date: dateProp?.date?.start || '',
        status: statusProp?.select?.name || 'Pending',
      };
      
      console.log('파싱된 데이터:', parsedData);
      return parsedData;
    });
  }

  private findPropertyByType(properties: any, type: string): any {
    for (const [key, value] of Object.entries(properties)) {
      if (value && typeof value === 'object' && 'type' in value && (value as any).type === type) {
        return value;
      }
    }
    return null;
  }
}

export default NotionApiService; 