const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 노션 API 프록시 엔드포인트
app.post('/api/notion/databases/:databaseId/query', async (req, res) => {
  try {
    const { databaseId } = req.params;
    const { apiKey, ...queryParams } = req.body;

    console.log('프록시 요청:', {
      databaseId,
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'missing',
      queryParams
    });

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryParams),
    });

    const data = await response.text();
    
    console.log('노션 API 응답 상태:', response.status);
    console.log('노션 API 응답:', data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Notion API Error',
        status: response.status,
        message: data
      });
    }

    res.json(JSON.parse(data));
  } catch (error) {
    console.error('프록시 오류:', error);
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
});

// 데이터베이스 정보 조회
app.get('/api/notion/databases/:databaseId', async (req, res) => {
  try {
    const { databaseId } = req.params;
    const { apiKey } = req.query;

    console.log('데이터베이스 정보 요청:', {
      databaseId,
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'missing'
    });

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    });

    const data = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Notion API Error',
        status: response.status,
        message: data
      });
    }

    res.json(JSON.parse(data));
  } catch (error) {
    console.error('프록시 오류:', error);
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 