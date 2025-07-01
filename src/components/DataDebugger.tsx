import React, { useState } from 'react';
import './DataDebugger.css';

interface DataDebuggerProps {
  apiResponse: any;
  parsedData: any[];
}

const DataDebugger: React.FC<DataDebuggerProps> = ({ apiResponse, parsedData }) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'parsed'>('raw');

  if (!apiResponse) {
    return null;
  }

  return (
    <div className="data-debugger">
      <div className="debugger-header">
        <h3>데이터 디버거</h3>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'raw' ? 'active' : ''} 
            onClick={() => setActiveTab('raw')}
          >
            원본 API 응답
          </button>
          <button 
            className={activeTab === 'parsed' ? 'active' : ''} 
            onClick={() => setActiveTab('parsed')}
          >
            파싱된 데이터
          </button>
        </div>
      </div>
      
      <div className="debugger-content">
        {activeTab === 'raw' && (
          <div className="json-viewer">
            <h4>노션 API 응답</h4>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
        
        {activeTab === 'parsed' && (
          <div className="parsed-data">
            <h4>파싱된 데이터 ({parsedData.length}개)</h4>
            {parsedData.length > 0 ? (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>고객</th>
                      <th>제품</th>
                      <th>금액</th>
                      <th>날짜</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.customer}</td>
                        <td>{item.product}</td>
                        <td>{item.amount}</td>
                        <td>{item.date}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>파싱된 데이터가 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDebugger; 