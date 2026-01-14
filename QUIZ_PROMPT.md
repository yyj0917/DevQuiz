# CS 퀴즈 문제 생성 프롬프트 모음

> DevDaily 프로젝트용 퀴즈 시드 데이터 생성 프롬프트

---

## 공통 설정

### 출력 JSON 스키마 (Supabase 호환)

```json
{
  "category": "카테고리 slug (예: data-structure, algorithm, os, network, database, computer-architecture)",
  "type": "multiple | ox | blank | code",
  "difficulty": 1 | 2 | 3,
  "question": "문제 텍스트",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "answer": "정답 (객관식: 0-3 인덱스, OX: true/false, 빈칸: 정답 텍스트)",
  "explanation": "해설 (왜 정답인지 + 오답이 왜 틀렸는지)",
  "tags": ["세부주제", "관련키워드"],
  "source": "출처 또는 null"
}
```

### 난이도 기준

| 레벨 | 설명 | 예시 |
|------|------|------|
| 1 (Easy) | 기본 개념, 정의, 암기 | "스택의 특징은?" |
| 2 (Medium) | 비교, 응용, 동작 원리 | "스택과 큐의 차이점은?" |
| 3 (Hard) | 심화, 함정, 실제 적용 | "특정 상황에서 최적의 자료구조는?" |

### 문제 유형별 가이드

- **multiple**: 4지선다, 오답도 그럴듯하게
- **ox**: 미묘한 차이로 헷갈리는 명제
- **blank**: 핵심 용어 빈칸
- **code**: 의사코드 또는 간단한 코드 결과 예측

---

## 1. 자료구조 (data-structure)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
프론트엔드/백엔드 신입 개발자 면접을 위한 자료구조 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: data-structure
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 3개, Medium 5개, Hard 2개
- 문제 유형: multiple 6개, ox 2개, blank 2개

## 세부 주제 (택1 또는 복합)
- 배열과 연결 리스트
- 스택과 큐
- 해시 테이블
- 트리 (이진 트리, BST, 힙)
- 그래프
- 우선순위 큐

## 요구사항
1. 실제 기술 면접에서 출제되는 스타일
2. 오답 선택지는 흔히 하는 실수나 비슷한 개념으로 구성
3. 해설에는 정답 이유 + 각 오답이 틀린 이유 포함
4. 실무에서 "언제 이 자료구조를 쓰는지" 맥락 포함

## 출력 형식
JSON 배열로 출력. 각 문제는 다음 스키마를 따름:
{
  "category": "data-structure",
  "type": "multiple | ox | blank",
  "difficulty": 1 | 2 | 3,
  "question": "문제",
  "options": ["A", "B", "C", "D"],  // ox, blank는 null
  "answer": "정답",
  "explanation": "해설",
  "tags": ["스택", "LIFO"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

### 세부 주제별 예시 요청

```
# 스택/큐 집중
세부 주제: 스택과 큐
포함할 내용:
- 스택의 LIFO 원리
- 큐의 FIFO 원리
- 원형 큐
- 덱(Deque)
- 스택으로 큐 구현, 큐로 스택 구현
- 실무 활용 (브라우저 히스토리, 작업 스케줄링)
```

---

## 2. 알고리즘 (algorithm)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
프론트엔드/백엔드 신입 개발자 면접을 위한 알고리즘 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: algorithm
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 3개, Medium 5개, Hard 2개
- 문제 유형: multiple 5개, ox 2개, code 3개

## 세부 주제 (택1 또는 복합)
- 시간/공간 복잡도 (Big-O)
- 정렬 알고리즘 (버블, 선택, 삽입, 퀵, 병합, 힙)
- 탐색 알고리즘 (선형, 이진 탐색)
- 재귀와 분할 정복
- 동적 프로그래밍 (DP)
- 그래프 알고리즘 (BFS, DFS, 다익스트라)
- 그리디 알고리즘

## 요구사항
1. 시간복잡도 관련 문제 필수 포함
2. 코드 문제는 의사코드 또는 간단한 JavaScript/Python
3. "이 상황에서 어떤 알고리즘?" 유형 포함
4. 실무 맥락 (실제로 어디서 쓰이는지)

## 출력 형식
JSON 배열로 출력. code 유형은 code_snippet 필드 추가:
{
  "category": "algorithm",
  "type": "code",
  "difficulty": 2,
  "question": "다음 코드의 시간복잡도는?",
  "code_snippet": "for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    console.log(i, j);\n  }\n}",
  "options": ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
  "answer": "2",
  "explanation": "중첩 반복문이 각각 n번씩 실행되므로 O(n²)",
  "tags": ["시간복잡도", "Big-O", "중첩반복문"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

---

## 3. 운영체제 (os)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
신입 개발자 면접을 위한 운영체제 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: os
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 3개, Medium 5개, Hard 2개
- 문제 유형: multiple 6개, ox 3개, blank 1개

## 세부 주제 (택1 또는 복합)
- 프로세스와 스레드
- CPU 스케줄링 (FCFS, SJF, RR, 우선순위)
- 동기화 (뮤텍스, 세마포어, 데드락)
- 메모리 관리 (페이징, 세그멘테이션, 가상 메모리)
- 파일 시스템
- 인터럽트와 시스템 콜

## 요구사항
1. 프로세스 vs 스레드 비교 문제 필수
2. 데드락 4가지 조건 관련 문제 포함
3. 실무 연관성 (멀티스레딩, 메모리 누수 등)
4. 면접 빈출 주제 우선

## 출력 형식
JSON 배열로 출력:
{
  "category": "os",
  "type": "multiple",
  "difficulty": 2,
  "question": "문제",
  "options": ["A", "B", "C", "D"],
  "answer": "정답 인덱스",
  "explanation": "해설",
  "tags": ["프로세스", "스레드"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

---

## 4. 네트워크 (network)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
신입 개발자 면접을 위한 네트워크 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: network
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 3개, Medium 5개, Hard 2개
- 문제 유형: multiple 6개, ox 3개, blank 1개

## 세부 주제 (택1 또는 복합)
- OSI 7계층 / TCP/IP 4계층
- HTTP/HTTPS (메서드, 상태코드, 헤더)
- TCP vs UDP
- DNS 동작 원리
- 쿠키, 세션, JWT
- REST API
- WebSocket
- CORS
- 로드밸런싱, CDN

## 요구사항
1. 프론트엔드 개발자에게 실용적인 주제 우선 (HTTP, CORS, REST)
2. "브라우저에 URL 입력하면 일어나는 일" 시나리오 문제
3. 상태코드 (200, 301, 400, 401, 403, 404, 500) 관련 문제
4. 실무에서 자주 만나는 이슈 반영

## 출력 형식
JSON 배열로 출력:
{
  "category": "network",
  "type": "multiple",
  "difficulty": 2,
  "question": "HTTP 상태코드 401과 403의 차이점으로 올바른 것은?",
  "options": [
    "401은 인증 실패, 403은 권한 없음",
    "401은 권한 없음, 403은 인증 실패",
    "둘 다 같은 의미",
    "401은 서버 오류, 403은 클라이언트 오류"
  ],
  "answer": "0",
  "explanation": "401 Unauthorized는 인증이 필요하거나 인증에 실패한 경우, 403 Forbidden은 인증은 됐지만 해당 리소스에 대한 권한이 없는 경우입니다.",
  "tags": ["HTTP", "상태코드", "인증"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

---

## 5. 데이터베이스 (database)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
신입 개발자 면접을 위한 데이터베이스 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: database
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 3개, Medium 5개, Hard 2개
- 문제 유형: multiple 5개, ox 2개, code 3개 (SQL)

## 세부 주제 (택1 또는 복합)
- 관계형 DB 기초 (테이블, 키, 관계)
- SQL 기본 (SELECT, JOIN, GROUP BY)
- 인덱스와 최적화
- 정규화 (1NF, 2NF, 3NF, BCNF)
- 트랜잭션과 ACID
- NoSQL vs SQL
- ORM 기초

## 요구사항
1. SQL 쿼리 결과 예측 문제 포함
2. 인덱스가 성능에 미치는 영향 문제
3. 정규화 단계별 차이 문제
4. 실무 시나리오 (N+1 문제, 느린 쿼리 등)

## 출력 형식
JSON 배열로 출력. SQL 문제는 code_snippet 사용:
{
  "category": "database",
  "type": "code",
  "difficulty": 2,
  "question": "다음 SQL의 실행 결과로 올바른 것은?",
  "code_snippet": "SELECT department, COUNT(*) as cnt\nFROM employees\nGROUP BY department\nHAVING cnt > 5;",
  "options": ["모든 부서의 직원 수", "직원이 5명 초과인 부서만", "직원이 5명 이상인 부서만", "에러 발생"],
  "answer": "1",
  "explanation": "HAVING은 GROUP BY 결과에 조건을 적용합니다. cnt > 5이므로 5명 초과(6명 이상)인 부서만 출력됩니다.",
  "tags": ["SQL", "GROUP BY", "HAVING"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

---

## 6. 컴퓨터 구조 (computer-architecture)

### 프롬프트

```
당신은 CS 전공 교수이자 빅테크 기술 면접관입니다.
신입 개발자 면접을 위한 컴퓨터 구조 퀴즈를 생성해주세요.

## 생성 조건
- 카테고리: computer-architecture
- 세부 주제: [아래에서 선택]
- 문제 수: 10개
- 난이도 배분: Easy 4개, Medium 4개, Hard 2개
- 문제 유형: multiple 7개, ox 2개, blank 1개

## 세부 주제 (택1 또는 복합)
- CPU 구조 (ALU, 레지스터, 제어장치)
- 메모리 계층 (캐시, RAM, 디스크)
- 캐시 메모리 (L1, L2, L3, 캐시 히트/미스)
- 명령어 사이클
- 파이프라이닝
- 병렬 처리
- 고정/부동 소수점

## 요구사항
1. 캐시 관련 문제 필수 (프론트엔드도 알아야 함)
2. 메모리 계층 속도 비교 문제
3. 지나치게 하드웨어적인 내용은 피하고 개발자 관점 유지
4. 성능 최적화와 연관된 내용 우선

## 출력 형식
JSON 배열로 출력:
{
  "category": "computer-architecture",
  "type": "multiple",
  "difficulty": 1,
  "question": "다음 중 메모리 접근 속도가 가장 빠른 것은?",
  "options": ["HDD", "RAM", "CPU 캐시", "SSD"],
  "answer": "2",
  "explanation": "속도 순서: CPU 레지스터 > CPU 캐시 > RAM > SSD > HDD. CPU 캐시는 CPU와 RAM 사이에서 자주 사용되는 데이터를 저장해 빠른 접근을 가능하게 합니다.",
  "tags": ["메모리 계층", "캐시"],
  "source": null
}

JSON만 출력하고 다른 설명은 하지 마세요.
```

---

## 사용 가이드

### 1회 요청 권장 분량
- 10문제씩 요청 (품질 유지)
- 세부 주제는 1-2개로 집중

### 요청 예시

```
위 프롬프트에서 다음 조건으로 생성해줘:

카테고리: 네트워크
세부 주제: HTTP/HTTPS, REST API
난이도: Medium 위주 (Easy 2, Medium 6, Hard 2)

프론트엔드 개발자 면접에 특화해서 만들어줘.
```

### 검수 체크리스트

생성된 문제를 받으면 확인할 것:
- [ ] 정답이 실제로 맞는지
- [ ] 오답 선택지가 너무 뻔하지 않은지
- [ ] 해설이 충분히 이해되는지
- [ ] 난이도가 적절한지
- [ ] 중복 문제 없는지

### 파일 저장 규칙

```
/seeds
  /questions
    data-structure-01.json  (1차 생성분)
    data-structure-02.json  (2차 생성분)
    algorithm-01.json
    os-01.json
    network-01.json
    database-01.json
    computer-architecture-01.json
```

---

## 빠른 시작

### Step 1: 카테고리 선택
원하는 카테고리의 프롬프트를 복사

### Step 2: 세부 주제 지정
프롬프트 내 [아래에서 선택] 부분을 구체화

### Step 3: 생성 요청
Claude에게 프롬프트 전달

### Step 4: 검수
생성된 JSON 확인 및 수정

### Step 5: 저장
파일로 저장하여 시드 데이터 축적