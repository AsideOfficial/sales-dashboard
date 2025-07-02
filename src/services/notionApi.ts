import type { NotionQueryResponse, SalesData } from '../types/notion';

class NotionApiService {
  private apiKey: string;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.apiKey = apiKey;
    this.databaseId = databaseId;
  }

  async queryDatabase(onProgress?: (progress: number, message: string) => void): Promise<NotionQueryResponse> {
    try {
      console.log('API 요청 시작:', {
        databaseId: this.databaseId,
        apiKey: '***' // 보안상 숨김
      });

      let allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;
      let pageCount = 0;

      // 페이지네이션을 통해 모든 데이터를 가져옴
      while (hasMore) {
        pageCount++;
        const requestBody: any = {
          page_size: 100, // 최대 페이지 크기
        };

        if (startCursor) {
          requestBody.start_cursor = startCursor;
        }

        // 진행률 업데이트
        if (onProgress) {
          const progress = Math.min((pageCount - 1) * 20, 80); // 0-80% 범위
          onProgress(progress, `${pageCount}번째 페이지 로딩 중...`);
        }

        const response = await fetch(`/api/notion/v1/databases/${this.databaseId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 오류 응답:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        
        // 결과를 누적
        allResults = allResults.concat(data.results);
        
        // 다음 페이지가 있는지 확인
        hasMore = data.has_more;
        startCursor = data.next_cursor;
        
        console.log(`페이지 로드 완료: ${data.results.length}개 항목, 총 ${allResults.length}개 누적`);
        
        // API 호출 제한을 피하기 위해 잠시 대기
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // 전체 결과를 NotionQueryResponse 형태로 반환
      const finalResponse: NotionQueryResponse = {
        results: allResults,
        has_more: false,
      };
      
      console.log(`전체 데이터 로드 완료: 총 ${allResults.length}개 항목`);
      console.log('노션 API 응답:', JSON.stringify(finalResponse, null, 2));
      
      return finalResponse;
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
      
      // 실제 API 응답 구조에 맞게 파싱
      const status = this.extractStatusValue(properties, '상태 1');
      const customerName = this.extractRichTextValue(properties, '의원명');
      const department = this.extractSelectValue(properties, '진료과목');
      const salesRep = this.extractSelectValue(properties, '영업 담당자');
      const district = this.extractSelectValue(properties, '지역구');
      const visitCount = this.extractSelectValue(properties, '방문차수');
      const reaction = this.extractSelectValue(properties, '반응');
      const salesStage = this.extractSelectValue(properties, '세일즈단계');
      
      // 디버깅을 위한 로그
      console.log('추출된 값들:', {
        status,
        customerName,
        department,
        salesRep,
        district,
        visitCount,
        reaction,
        salesStage
      });
      
      const parsedData = {
        id: page.id,
        status: status && status !== '' ? status : '미정',
        customerName: customerName && customerName !== '' ? customerName : '이름 없음',
        department: department && department !== '' ? department : '미정',
        salesRep: salesRep && salesRep !== '' ? salesRep : '미정',
        district: district && district !== '' ? district : '미정',
        visitCount: visitCount && visitCount !== '' ? visitCount : '미정',
        firstVisitDate: this.extractDateValue(properties, '최초방문일자') || '',
        lastVisitDate: this.extractDateValue(properties, '최종방문일자') || '',
        reaction: reaction && reaction !== '' ? reaction : '미정',
        salesStage: salesStage && salesStage !== '' ? salesStage : '미정',
        notes: this.extractRichTextValue(properties, '특이사항') || '',
        fax: this.extractPhoneValue(properties, 'FAX') || '',
        phone: this.extractPhoneValue(properties, '전화번호') || '',
        email: this.extractEmailValue(properties, '이메일') || '',
        remarks: this.extractTitleValue(properties, '비고') || '',
      };
      
      console.log('최종 파싱된 데이터:', parsedData);
      return parsedData;
    });
  }



  private extractSelectValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    console.log(`extractSelectValue - ${propertyName}:`, prop);
    if (prop?.type === 'select' && prop.select?.name) {
      console.log(`extractSelectValue - ${propertyName} 결과:`, prop.select.name);
      return prop.select.name;
    }
    // select 필드가 null인 경우 빈 문자열 반환
    if (prop?.type === 'select' && prop.select === null) {
      console.log(`extractSelectValue - ${propertyName} null: 빈 문자열 반환`);
      return '';
    }
    console.log(`extractSelectValue - ${propertyName} 실패: null 반환`);
    return null;
  }



  private extractDateValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'date' && prop.date?.start) {
      return prop.date.start;
    }
    return null;
  }



  private extractStatusValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    console.log(`extractStatusValue - ${propertyName}:`, prop);
    if (prop?.type === 'status' && prop.status?.name) {
      console.log(`extractStatusValue - ${propertyName} 결과:`, prop.status.name);
      return prop.status.name;
    }
    // status 필드가 null인 경우 빈 문자열 반환
    if (prop?.type === 'status' && prop.status === null) {
      console.log(`extractStatusValue - ${propertyName} null: 빈 문자열 반환`);
      return '';
    }
    console.log(`extractStatusValue - ${propertyName} 실패: null 반환`);
    return null;
  }

  private extractRichTextValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    console.log(`extractRichTextValue - ${propertyName}:`, prop);
    if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
      console.log(`extractRichTextValue - ${propertyName} title 결과:`, prop.title[0].plain_text);
      return prop.title[0].plain_text;
    }
    if (prop?.type === 'rich_text' && prop.rich_text?.[0]?.plain_text) {
      console.log(`extractRichTextValue - ${propertyName} rich_text 결과:`, prop.rich_text[0].plain_text);
      return prop.rich_text[0].plain_text;
    }
    console.log(`extractRichTextValue - ${propertyName} 실패: null 반환`);
    return null;
  }

  private extractPhoneValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'phone_number' && prop.phone_number) {
      return prop.phone_number;
    }
    return null;
  }

  private extractEmailValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'email' && prop.email) {
      return prop.email;
    }
    return null;
  }

  private extractTitleValue(properties: any, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
    return null;
  }
}

export default NotionApiService; 