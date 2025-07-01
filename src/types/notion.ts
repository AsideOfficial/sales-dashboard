export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
}

export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

export interface SalesData {
  id: string;
  status: string;           // 상태
  customerName: string;     // 의원명
  department: string;       // 진료과목
  salesRep: string;         // 영업 담당자
  district: string;         // 지역구
  visitCount: string;       // 방문차수
  firstVisitDate: string;   // 최초방문일자
  lastVisitDate: string;    // 최종방문일자
  reaction: string;         // 반응
  salesStage: string;       // 세일즈단계
  notes: string;           // 특이사항
  fax: string;             // FAX
  phone: string;           // 전화번호
  email: string;           // 이메일
  remarks: string;         // 비고
} 