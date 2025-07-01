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
        apiKey: this.apiKey.substring(0, 10) + '...'
      });

      const response = await fetch(`http://localhost:3001/api/notion/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          // sorts를 제거하고 기본 쿼리만 시도
        }),
      });

      console.log('API 응답 상태:', response.status, response.statusText);

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
      const response = await fetch(`http://localhost:3001/api/notion/databases/${this.databaseId}?apiKey=${this.apiKey}`, {
        method: 'GET',
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
      
      // 속성 이름을 동적으로 찾기 (여러 개의 select 타입이 있을 수 있으므로)
      const titleProps = this.findPropertiesByType(properties, 'title');
      const selectProps = this.findPropertiesByType(properties, 'select');
      const numberProps = this.findPropertiesByType(properties, 'number');
      const dateProps = this.findPropertiesByType(properties, 'date');
      
      console.log('찾은 속성들:', {
        title: titleProps,
        select: selectProps,
        number: numberProps,
        date: dateProps
      });
      
      // 첫 번째 title 속성을 고객명으로 사용
      const customerProp = titleProps[0];
      // 첫 번째 number 속성을 금액으로 사용
      const amountProp = numberProps[0];
      // 첫 번째 date 속성을 날짜로 사용
      const dateProp = dateProps[0];
      // select 속성들을 제품과 상태로 구분 (실제 데이터에 따라 조정 필요)
      const productProp = selectProps[0];
      const statusProp = selectProps[1] || selectProps[0];
      
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