import React, { useState } from 'react';
import './PropertyMapper.css';

interface PropertyMapperProps {
  properties: Record<string, any>;
  onMappingChange: (mapping: Record<string, string>) => void;
  currentMapping: Record<string, string>;
}

const PropertyMapper: React.FC<PropertyMapperProps> = ({ properties, onMappingChange, currentMapping }) => {
  const [isOpen, setIsOpen] = useState(false);

  const propertyTypes = {
    customer: ['title', 'rich_text'],
    product: ['select', 'multi_select'],
    amount: ['number'],
    date: ['date'],
    status: ['select', 'multi_select']
  };

  const getAvailableProperties = (type: string) => {
    return Object.entries(properties).filter(([, value]) => 
      propertyTypes[type as keyof typeof propertyTypes]?.includes(value?.type)
    );
  };

  const handleMappingChange = (field: string, propertyName: string) => {
    const newMapping = { ...currentMapping, [field]: propertyName };
    onMappingChange(newMapping);
  };

  if (!isOpen) {
    return (
      <button 
        className="property-mapper-toggle"
        onClick={() => setIsOpen(true)}
      >
        속성 매핑 설정
      </button>
    );
  }

  return (
    <div className="property-mapper">
      <div className="mapper-header">
        <h3>속성 매핑 설정</h3>
        <button onClick={() => setIsOpen(false)}>닫기</button>
      </div>
      
      <div className="mapper-content">
        <div className="mapping-section">
          <h4>고객명 (Customer)</h4>
          <select 
            value={currentMapping.customer || ''} 
            onChange={(e) => handleMappingChange('customer', e.target.value)}
          >
            <option value="">선택하세요</option>
            {getAvailableProperties('customer').map(([key, value]) => (
              <option key={key} value={key}>
                {key} ({value.type})
              </option>
            ))}
          </select>
        </div>

        <div className="mapping-section">
          <h4>제품 (Product)</h4>
          <select 
            value={currentMapping.product || ''} 
            onChange={(e) => handleMappingChange('product', e.target.value)}
          >
            <option value="">선택하세요</option>
            {getAvailableProperties('product').map(([key, value]) => (
              <option key={key} value={key}>
                {key} ({value.type})
              </option>
            ))}
          </select>
        </div>

        <div className="mapping-section">
          <h4>금액 (Amount)</h4>
          <select 
            value={currentMapping.amount || ''} 
            onChange={(e) => handleMappingChange('amount', e.target.value)}
          >
            <option value="">선택하세요</option>
            {getAvailableProperties('amount').map(([key, value]) => (
              <option key={key} value={key}>
                {key} ({value.type})
              </option>
            ))}
          </select>
        </div>

        <div className="mapping-section">
          <h4>날짜 (Date)</h4>
          <select 
            value={currentMapping.date || ''} 
            onChange={(e) => handleMappingChange('date', e.target.value)}
          >
            <option value="">선택하세요</option>
            {getAvailableProperties('date').map(([key, value]) => (
              <option key={key} value={key}>
                {key} ({value.type})
              </option>
            ))}
          </select>
        </div>

        <div className="mapping-section">
          <h4>상태 (Status)</h4>
          <select 
            value={currentMapping.status || ''} 
            onChange={(e) => handleMappingChange('status', e.target.value)}
          >
            <option value="">선택하세요</option>
            {getAvailableProperties('status').map(([key, value]) => (
              <option key={key} value={key}>
                {key} ({value.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mapper-footer">
        <p>현재 매핑: {JSON.stringify(currentMapping, null, 2)}</p>
      </div>
    </div>
  );
};

export default PropertyMapper; 