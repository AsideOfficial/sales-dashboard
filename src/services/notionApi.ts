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
    return pages.map(page => {
      const properties = page.properties;
      
      return {
        id: page.id,
        customer: properties.Customer?.title?.[0]?.plain_text || 'Unknown',
        product: properties.Product?.select?.name || 'Unknown',
        amount: properties.Amount?.number || 0,
        date: properties.Date?.date?.start || '',
        status: properties.Status?.select?.name || 'Pending',
      };
    });
  }
}

export default NotionApiService; 