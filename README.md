# 노션 판매 대시보드

노션 API를 활용하여 노션 데이터베이스의 판매 데이터를 시각화하는 대시보드입니다.

## 기능

- 📊 실시간 판매 데이터 시각화
- 📈 월별 매출 추이 차트
- 🥧 주문 상태 분포 파이 차트
- 📋 최근 주문 목록 테이블
- 🔄 실시간 데이터 새로고침
- 📱 반응형 디자인

## 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Charts**: Recharts
- **API**: Notion API (@notionhq/client)
- **Styling**: CSS3

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 `http://localhost:5173` 접속

## 설정 방법

### 1. 노션 API 키 생성

1. [노션 통합 페이지](https://www.notion.so/my-integrations)로 이동
2. "새 통합" 버튼 클릭
3. 통합 이름 입력 (예: "판매 대시보드")
4. Submit 클릭
5. 생성된 "Internal Integration Token"을 복사

### 2. 데이터베이스 ID 찾기

1. 노션에서 해당 데이터베이스 페이지로 이동
2. URL에서 데이터베이스 ID 복사
3. URL 형식: `https://notion.so/workspace/[database-id]?v=...`
4. 대시보드에 [database-id] 부분만 입력

### 3. 데이터베이스 권한 설정

1. 데이터베이스 페이지에서 우상단 "..." 클릭
2. "Add connections" 선택
3. 생성한 통합을 찾아서 추가

### 4. 데이터베이스 구조

다음 속성들이 필요합니다:

- **Customer** (Title) - 고객명
- **Product** (Select) - 제품명
- **Amount** (Number) - 판매 금액
- **Date** (Date) - 판매 날짜
- **Status** (Select) - 주문 상태

## 사용법

1. 애플리케이션 실행 후 설정 화면에서 API 키와 데이터베이스 ID 입력
2. "대시보드 시작하기" 버튼 클릭
3. 대시보드에서 실시간 데이터 확인
4. "새로고침" 버튼으로 최신 데이터 업데이트
5. 우상단 "설정 변경" 버튼으로 설정 수정 가능

## 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드 결과물 미리보기:
```bash
npm run preview
```

## 라이선스

MIT License
