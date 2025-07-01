import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { SalesData } from '../types/notion';
import NotionApiService from '../services/notionApi';
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
  const monthlyData = salesData.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += sale.amount;
      existing.count += 1;
    } else {
      acc.push({ month, amount: sale.amount, count: 1 });
    }
    return acc;
  }, [] as { month: string; amount: number; count: number }[]);

  const statusData = salesData.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = salesData.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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
        <button onClick={refreshData} className="refresh-button">
          새로고침
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>총 매출</h3>
          <p className="stat-value">₩{totalSales.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>총 주문 수</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>평균 주문 금액</h3>
          <p className="stat-value">₩{averageOrderValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>월별 매출 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

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

      <div className="recent-orders">
        <h3>최근 주문</h3>
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>고객</th>
                <th>제품</th>
                <th>금액</th>
                <th>날짜</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {salesData.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>₩{order.amount.toLocaleString()}</td>
                  <td>{new Date(order.date).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 