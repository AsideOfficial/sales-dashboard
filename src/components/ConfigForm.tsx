import React, { useState } from 'react';
import './ConfigForm.css';

interface ConfigFormProps {
  onConfigSubmit: (apiKey: string, databaseId: string) => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ onConfigSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() && databaseId.trim()) {
      onConfigSubmit(apiKey.trim(), databaseId.trim());
    }
  };

  return (
    <div className="config-form-container">
      <div className="config-form">
        <h1>노션 판매 대시보드</h1>
        <p className="subtitle">노션 데이터베이스의 판매 데이터를 시각화합니다</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">노션 API 키</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_..."
              required
            />
            <small>
              <button 
                type="button" 
                className="help-link"
                onClick={() => setShowHelp(!showHelp)}
              >
                API 키를 어떻게 얻나요?
              </button>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="databaseId">데이터베이스 ID</label>
            <input
              type="text"
              id="databaseId"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
              required
            />
            <small>
              <button 
                type="button" 
                className="help-link"
                onClick={() => setShowHelp(!showHelp)}
              >
                데이터베이스 ID를 어떻게 찾나요?
              </button>
            </small>
          </div>

          <button type="submit" className="submit-button">
            대시보드 시작하기
          </button>
        </form>

        {showHelp && (
          <div className="help-section">
            <h3>설정 방법</h3>
            
            <div className="help-item">
              <h4>1. 노션 API 키 생성</h4>
              <ol>
                <li><a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">노션 통합 페이지</a>로 이동</li>
                <li>"새 통합" 버튼 클릭</li>
                <li>통합 이름 입력 (예: "판매 대시보드")</li>
                <li>Submit 클릭</li>
                <li>생성된 "Internal Integration Token"을 복사</li>
              </ol>
            </div>

            <div className="help-item">
              <h4>2. 데이터베이스 ID 찾기</h4>
              <ol>
                <li>노션에서 해당 데이터베이스 페이지로 이동</li>
                <li>URL에서 데이터베이스 ID 복사</li>
                <li>URL 형식: <code>https://notion.so/workspace/[database-id]?v=...</code></li>
                <li>대시보드에 [database-id] 부분만 입력</li>
              </ol>
            </div>

            <div className="help-item">
              <h4>3. 데이터베이스 권한 설정</h4>
              <ol>
                <li>데이터베이스 페이지에서 우상단 "..." 클릭</li>
                <li>"Add connections" 선택</li>
                <li>생성한 통합을 찾아서 추가</li>
              </ol>
            </div>

            <div className="help-item">
              <h4>4. 데이터베이스 구조</h4>
              <p>다음 속성들이 필요합니다:</p>
              <ul>
                <li><strong>Customer</strong> (Title) - 고객명</li>
                <li><strong>Product</strong> (Select) - 제품명</li>
                <li><strong>Amount</strong> (Number) - 판매 금액</li>
                <li><strong>Date</strong> (Date) - 판매 날짜</li>
                <li><strong>Status</strong> (Select) - 주문 상태</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigForm; 