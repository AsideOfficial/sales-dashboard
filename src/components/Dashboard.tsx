import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { SalesData } from '../types/notion';
import NotionApiService from '../services/notionApi';
import DataDebugger from './DataDebugger';
import './Dashboard.css';

interface DashboardProps {
  apiKey: string;
  databaseId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey, databaseId }) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('데이터를 불러오는 중...');
  const [error, setError] = useState<string | null>(null);
  const [notionService, setNotionService] = useState<NotionApiService | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDebugger) {
        setShowDebugger(false);
      }
    };

    if (showDebugger) {
      document.addEventListener('keydown', handleEscKey);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showDebugger]);

  useEffect(() => {
    if (apiKey && databaseId) {
      const service = new NotionApiService(apiKey, databaseId);
      setNotionService(service);
      fetchData(service);
    }
  }, [apiKey, databaseId]);

  const fetchData = async (service: NotionApiService) => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('데이터를 불러오는 중...');
      
      const response = await service.queryDatabase(
        (progress: number, message: string) => {
          setLoadingProgress(progress);
          setLoadingMessage(message);
        }
      );
      
      setLoadingMessage('데이터 파싱 중...');
      setLoadingProgress(90);
      
      setApiResponse(response);
      const parsedData = service.parseSalesData(response.results);
      setSalesData(parsedData);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const refreshData = () => {
    if (notionService) {
      fetchData(notionService);
    }
  };

  // 디버깅: 실제 데이터 구조 확인
  console.log('=== 데이터 디버깅 ===');
  console.log('전체 데이터 개수:', salesData.length);
  if (salesData.length > 0) {
    console.log('첫 번째 데이터 샘플:', salesData[0]);
    console.log('모든 상태 값들:', [...new Set(salesData.map(sale => sale.status))]);
    console.log('모든 세일즈 단계들:', [...new Set(salesData.map(sale => sale.salesStage))]);
    console.log('모든 방문횟수들:', [...new Set(salesData.map(sale => sale.visitCount))]);
    console.log('모든 반응들:', [...new Set(salesData.map(sale => sale.reaction))]);
  }

  // 차트 데이터 준비 - 상태 정규화
  const statusData = salesData.reduce((acc, sale) => {
    let status = sale.status || '미정';
    
    // 상태 데이터 정규화
    status = status.trim();
    if (status === '' || status === 'Unknown' || status === 'unknown') {
      status = '미정';
    }
    
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  // 세일즈 단계별 데이터 - 정규화
  const salesStageData = salesData.reduce((acc, sale) => {
    let stage = sale.salesStage || '미정';
    
    // 세일즈 단계 정규화 (대소문자 구분 없이)
    stage = stage.toUpperCase().trim();
    if (stage === 'S') stage = 'S';
    else if (stage === 'A') stage = 'A';
    else if (stage === 'B') stage = 'B';
    else if (stage === 'C') stage = 'C';
    else if (stage === 'D') stage = 'D';
    else stage = '미정';
    
    if (acc[stage]) {
      acc[stage].count += 1;
    } else {
      acc[stage] = { count: 1 };
    }
    return acc;
  }, {} as Record<string, { count: number }>);

  const salesStageChartData = Object.entries(salesStageData)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => {
      // 세일즈 단계 순서대로 정렬 (S > A > B > C > D > 미정)
      const order = ['S', 'A', 'B', 'C', 'D', '미정'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  // 반응별 데이터 - 정규화
  const reactionData = salesData.reduce((acc, sale) => {
    let reaction = sale.reaction || '미정';
    
    // 반응 데이터 정규화
    reaction = reaction.trim();
    if (reaction === '' || reaction === 'Unknown' || reaction === 'unknown') {
      reaction = '미정';
    }
    
    if (acc[reaction]) {
      acc[reaction].count += 1;
    } else {
      acc[reaction] = { count: 1 };
    }
    return acc;
  }, {} as Record<string, { count: number }>);

  const reactionChartData = Object.entries(reactionData)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => b.count - a.count);

  // 방문차수별 데이터 - 숫자로 정규화
  const visitCountData = salesData.reduce((acc, sale) => {
    let visitCount = sale.visitCount || '0';
    
    // 방문차수 텍스트에서 숫자만 추출 (1차, 2차 등)
    let visitNum = 0;
    visitCount = visitCount.trim();
    
    if (visitCount.includes('차')) {
      visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
    } else if (visitCount.includes('회')) {
      visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
    } else {
      visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
    }
    
    // 방문차수 범위로 그룹화
    let range = '';
    if (visitNum === 0) range = '0회';
    else if (visitNum === 1) range = '1회';
    else if (visitNum === 2) range = '2회';
    else if (visitNum === 3) range = '3회';
    else if (visitNum <= 5) range = '4-5회';
    else if (visitNum <= 10) range = '6-10회';
    else range = '10회+';
    
    if (acc[range]) {
      acc[range].count += 1;
    } else {
      acc[range] = { count: 1 };
    }
    return acc;
  }, {} as Record<string, { count: number }>);

  const visitCountChartData = Object.entries(visitCountData)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => {
      // 범위 순서대로 정렬
      const order = ['0회', '1회', '2회', '3회', '4-5회', '6-10회', '10회+'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  const totalOrders = salesData.length;

  // 주요 고객 데이터 선별 (진행 중인 고객, 높은 방문차수, 특정 세일즈 단계 등)
  const keyCustomers = salesData
    .filter(sale => {
      let visitCount = sale.visitCount || '0';
      let visitNum = 0;
      visitCount = visitCount.trim();
      
      if (visitCount.includes('차')) {
        visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
      } else if (visitCount.includes('회')) {
        visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
      } else {
        visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
      }
      const stage = sale.salesStage?.toUpperCase() || '';
      
      return sale.status === '진행 중' || 
             sale.status === '시작 전' ||
             sale.status === '대기 중' ||
             visitNum >= 2 ||
             stage === 'A' ||
             stage === 'S';
    })
    .sort((a, b) => {
      // 상태별 우선순위: 진행 중 > 시작 전 > 대기 중 > 기타
      const statusPriority = { '진행 중': 4, '시작 전': 3, '대기 중': 2, '미정': 1 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // 세일즈 단계 우선순위: S > A > B > C > D > 미정
      const stagePriority = { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, '미정': 1 };
      const aStage = a.salesStage?.toUpperCase() || '미정';
      const bStage = b.salesStage?.toUpperCase() || '미정';
      const aStagePriority = stagePriority[aStage as keyof typeof stagePriority] || 0;
      const bStagePriority = stagePriority[bStage as keyof typeof stagePriority] || 0;
      
      if (aStagePriority !== bStagePriority) {
        return bStagePriority - aStagePriority;
      }
      
      // 방문차수로 정렬 (높은 순)
      let aVisitCount = a.visitCount || '0';
      let bVisitCount = b.visitCount || '0';
      let aVisits = 0;
      let bVisits = 0;
      
      aVisitCount = aVisitCount.trim();
      bVisitCount = bVisitCount.trim();
      
      if (aVisitCount.includes('차')) {
        aVisits = parseInt(aVisitCount.replace(/[^0-9]/g, '')) || 0;
      } else if (aVisitCount.includes('회')) {
        aVisits = parseInt(aVisitCount.replace(/[^0-9]/g, '')) || 0;
      } else {
        aVisits = parseInt(aVisitCount.replace(/[^0-9]/g, '')) || 0;
      }
      
      if (bVisitCount.includes('차')) {
        bVisits = parseInt(bVisitCount.replace(/[^0-9]/g, '')) || 0;
      } else if (bVisitCount.includes('회')) {
        bVisits = parseInt(bVisitCount.replace(/[^0-9]/g, '')) || 0;
      } else {
        bVisits = parseInt(bVisitCount.replace(/[^0-9]/g, '')) || 0;
      }
      
      return bVisits - aVisits;
    })
    .slice(0, 12); // 상위 12개 고객만 표시

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{loadingMessage}</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{loadingProgress}%</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={refreshData}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>다음진료 세일즈 현황판</h1>
        <div className="header-buttons">
          <button onClick={refreshData} className="refresh-button">
            새로고침
          </button>
          <button 
            onClick={() => setShowDebugger(!showDebugger)} 
            className="debug-button"
          >
            {showDebugger ? '디버거 숨기기' : '데이터 디버거'}
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>총 고객 수</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>진행 중인 고객</h3>
          <p className="stat-value">{salesData.filter(sale => sale.status === '진행 중').length}</p>
        </div>
        <div className="stat-card">
          <h3>완료된 고객</h3>
          <p className="stat-value">{salesData.filter(sale => sale.status === '완료' || sale.status === '완료됨').length}</p>
        </div>
        <div className="stat-card">
          <h3>평균 방문차수</h3>
          <p className="stat-value">
            {(salesData.reduce((sum, sale) => {
              let visitCount = sale.visitCount || '0';
              let visitNum = 0;
              visitCount = visitCount.trim();
              
              if (visitCount.includes('차')) {
                visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
              } else if (visitCount.includes('회')) {
                visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
              } else {
                visitNum = parseInt(visitCount.replace(/[^0-9]/g, '')) || 0;
              }
              return sum + visitNum;
            }, 0) / Math.max(salesData.length, 1)).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>주문 상태 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = ((percent || 0) * 100).toFixed(0);
                  // 레이블이 너무 길면 줄여서 표시
                  const shortName = name.length > 6 ? name.substring(0, 6) + '...' : name;
                  return `${shortName}\n${percentage}%`;
                }}
                outerRadius={70}
                fill="#0052cc"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#0052cc', '#0065ff', '#4c9aff', '#7bb3ff'][index % 4]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value}개`, name]}
                labelFormatter={(label) => `상태: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>세일즈 단계별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesStageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0052cc" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>방문차수별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitCountChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0065ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>반응별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reactionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4c9aff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>데이터 요약</h3>
          <div className="data-summary">
            <div className="summary-item">
              <h4>총 고객 수</h4>
              <p>{salesData.length}개</p>
            </div>
            <div className="summary-item">
              <h4>진료과목 수</h4>
              <p>{new Set(salesData.map(sale => sale.department)).size}개</p>
            </div>
            <div className="summary-item">
              <h4>세일즈 단계</h4>
              <p>{Object.keys(salesStageData).length}개</p>
            </div>
            <div className="summary-item">
              <h4>반응 종류</h4>
              <p>{Object.keys(reactionData).length}개</p>
            </div>
          </div>
        </div>
      </div>

      <div className="key-customers">
        <h3>주요 고객 리스트</h3>
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>의원명</th>
                <th>상태</th>
                <th>진료과목</th>
                <th>영업담당자</th>
                <th>지역구</th>
                <th>방문차수</th>
                <th>최종방문일자</th>
                <th>반응</th>
                <th>세일즈단계</th>
              </tr>
            </thead>
            <tbody>
              {keyCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.customerName}</td>
                  <td>
                    <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.department}</td>
                  <td>{customer.salesRep}</td>
                  <td>{customer.district}</td>
                  <td>{customer.visitCount}</td>
                  <td>{customer.lastVisitDate ? new Date(customer.lastVisitDate).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>{customer.reaction}</td>
                  <td>
                    <span className={`stage-badge stage-${customer.salesStage.toLowerCase()}`}>
                      {customer.salesStage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDebugger && (
        <div className="debugger-popup" onClick={() => setShowDebugger(false)}>
          <div className="debugger-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="debugger-popup-header">
              <h2>데이터 디버거</h2>
              <button 
                className="debugger-popup-close"
                onClick={() => setShowDebugger(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="debugger-popup-body">
              <DataDebugger 
                apiResponse={apiResponse} 
                parsedData={salesData} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 