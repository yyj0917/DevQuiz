// ============================================================================
// CATEGORY CONSTANTS
// ============================================================================

export const CATEGORIES = [
  {
    slug: 'data-structure' as const,
    name: '자료구조',
    icon: '🏗️',
    description: '배열, 리스트, 스택, 큐, 트리, 그래프 등 기본 자료구조',
  },
  {
    slug: 'algorithm' as const,
    name: '알고리즘',
    icon: '⚡',
    description: '정렬, 탐색, 동적 프로그래밍, 그리디 등 핵심 알고리즘',
  },
  {
    slug: 'os' as const,
    name: '운영체제',
    icon: '🖥️',
    description: '프로세스, 스레드, 메모리 관리, 파일 시스템',
  },
  {
    slug: 'network' as const,
    name: '네트워크',
    icon: '🌐',
    description: 'TCP/IP, HTTP, OSI 7계층, 네트워크 보안',
  },
  {
    slug: 'database' as const,
    name: '데이터베이스',
    icon: '🗄️',
    description: 'SQL, 정규화, 트랜잭션, 인덱스, 쿼리 최적화',
  },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];
