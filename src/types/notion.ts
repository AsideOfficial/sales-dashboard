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
  customer: string;
  status: string;
  visitCount: string;
  lastVisitDate: string;
  reaction: string;
  salesStage: string;
  amount: number;
  date: string;
} 