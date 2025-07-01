import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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
  const [error, setError] = useState<string | null>(null);
  const [notionService, setNotionService] = useState<NotionApiService | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);

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
      const response = await service.queryDatabase();
      setApiResponse(response);
      const parsedData = service.parseSalesData(response.results);
      setSalesData(parsedData);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (notionService) {
      fetchData(notionService);
    }
  };

  // 차트 데이터 준비
  const statusData = salesData.reduce((acc, sale) => {
    const status = sale.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  // 세일즈 단계별 데이터
  const salesStageData = salesData.reduce((acc, sale) => {
    const stage = sale.salesStage || 'Unknown';
    if (acc[stage]) {
      acc[stage].count += 1;
    } else {
      acc[stage] = { count: 1 };
    }
    return acc;
  }, {} as Record<string, { count: number }>);

  const salesStageChartData = Object.entries(salesStageData)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => b.count - a.count);

  // 반응별 데이터
  const reactionData = salesData.reduce((acc, sale) => {
    const reaction = sale.reaction || 'Unknown';
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

  // 방문차수별 데이터
  const visitCountData = salesData.reduce((acc, sale) => {
    const visitCount = sale.visitCount || 'Unknown';
    if (acc[visitCount]) {
      acc[visitCount].count += 1;
    } else {
      acc[visitCount] = { count: 1 };
    }
    return acc;
  }, {} as Record<string, { count: number }>);

  const visitCountChartData = Object.entries(visitCountData)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => {
      const aNum = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
      const bNum = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
      return aNum - bNum;
    });

  const totalOrders = salesData.length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>데이터를 불러오는 중...</p>
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
        <h1>노션 판매 대시보드</h1>
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
          <p className="stat-value">{salesData.filter(sale => sale.status === '완료').length}</p>
        </div>
        <div className="stat-card">
          <h3>평균 방문차수</h3>
          <p className="stat-value">
            {(salesData.reduce((sum, sale) => {
              const visitNum = parseInt(sale.visitCount.replace(/[^0-9]/g, '')) || 0;
              return sum + visitNum;
            }, 0) / salesData.length).toFixed(1)}
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
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
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
              <Bar dataKey="count" fill="#8884d8" />
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
              <Bar dataKey="count" fill="#82ca9d" />
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
              <Bar dataKey="count" fill="#ffc658" />
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

      <div className="recent-orders">
        <h3>고객 데이터</h3>
        <div className="orders-table">
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
              {salesData.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>{order.customerName}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.department}</td>
                  <td>{order.salesRep}</td>
                  <td>{order.district}</td>
                  <td>{order.visitCount}</td>
                  <td>{order.lastVisitDate ? new Date(order.lastVisitDate).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>{order.reaction}</td>
                  <td>
                    <span className={`stage-badge stage-${order.salesStage.toLowerCase()}`}>
                      {order.salesStage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDebugger && (
        <DataDebugger 
          apiResponse={apiResponse} 
          parsedData={salesData} 
        />
      )}
    </div>
  );
};

export default Dashboard; 