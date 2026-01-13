# Supabase 활용 가이드

> 이 문서는 Claude Code가 Supabase 관련 코드를 생성할 때 참고하는 범용 룰입니다.

---

## 1. 클라이언트 사용 원칙

### 환경별 클라이언트 선택

| 환경 | 파일 | 사용처 |
|------|------|--------|
| 브라우저 | `@/lib/supabase/client` | 클라이언트 컴포넌트, 이벤트 핸들러 |
| 서버 | `@/lib/supabase/server` | 서버 컴포넌트, Server Actions, Route Handlers |
| 미들웨어 | `@/lib/supabase/middleware` | middleware.ts |

### 사용 패턴
```typescript
// ❌ 잘못된 사용 - 서버에서 client 사용
'use server'
import { createClient } from '@/lib/supabase/client' // 틀림

// ✅ 올바른 사용
'use server'
import { createClient } from '@/lib/supabase/server'

export async function getPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('posts').select('*')
  
  if (error) throw new Error(error.message)
  return data
}
```

---

## 2. 데이터베이스 설계 원칙

### 테이블 네이밍
- **복수형 snake_case** 사용: `users`, `posts`, `post_comments`
- 중간 테이블(N:M): `{테이블1}_{테이블2}` (예: `post_tags`)

### 필수 컬럼 패턴
모든 테이블에 기본 포함:
```sql
id uuid default gen_random_uuid() primary key,
created_at timestamptz default now() not null,
updated_at timestamptz default now() not null
```

### 외래키 컬럼 네이밍
- `{참조테이블_단수형}_id`: `user_id`, `post_id`, `category_id`

### Soft Delete 패턴 (선택)
데이터 보존이 필요한 경우:
```sql
deleted_at timestamptz default null
```
```typescript
// 조회 시 삭제된 데이터 제외
.is('deleted_at', null)
```

---

## 3. RLS(Row Level Security) 정책 패턴

### 기본 원칙
- **모든 테이블에 RLS 활성화** 필수
- 정책 없으면 접근 불가 (기본 차단)

### 자주 사용하는 정책 패턴
```sql
-- ============================================
-- 패턴 1: 공개 읽기, 본인만 쓰기
-- ============================================
-- 누구나 조회 가능
create policy "공개 조회"
  on public.{테이블} for select
  using (true);

-- 본인 데이터만 생성
create policy "본인만 생성"
  on public.{테이블} for insert
  with check (auth.uid() = user_id);

-- 본인 데이터만 수정
create policy "본인만 수정"
  on public.{테이블} for update
  using (auth.uid() = user_id);

-- 본인 데이터만 삭제
create policy "본인만 삭제"
  on public.{테이블} for delete
  using (auth.uid() = user_id);

-- ============================================
-- 패턴 2: 본인 데이터만 전체 접근
-- ============================================
create policy "본인 데이터만 접근"
  on public.{테이블} for all
  using (auth.uid() = user_id);

-- ============================================
-- 패턴 3: 공개/비공개 구분
-- ============================================
create policy "공개 데이터 조회"
  on public.{테이블} for select
  using (is_public = true or auth.uid() = user_id);

-- ============================================
-- 패턴 4: 역할 기반 접근 (관리자)
-- ============================================
create policy "관리자 전체 접근"
  on public.{테이블} for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

---

## 4. 쿼리 패턴

### 기본 CRUD
```typescript
// CREATE
const { data, error } = await supabase
  .from('posts')
  .insert({ title, content, user_id })
  .select()
  .single()

// READ (단일)
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', id)
  .single()

// READ (목록)
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })

// UPDATE
const { data, error } = await supabase
  .from('posts')
  .update({ title, content })
  .eq('id', id)
  .select()
  .single()

// DELETE
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', id)
```

### 관계 데이터 조회 (JOIN)
```typescript
// 1:N - 게시글 + 작성자
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles!user_id (
      id,
      nickname,
      avatar_url
    )
  `)

// 1:N - 게시글 + 댓글들
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    comments (
      id,
      content,
      created_at,
      author:profiles!user_id (nickname)
    )
  `)
  .eq('id', postId)
  .single()

// N:M - 게시글 + 태그 (중간 테이블 경유)
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    post_tags (
      tags (id, name)
    )
  `)
```

### 페이지네이션
```typescript
// Offset 기반 (간단, 소규모)
const PAGE_SIZE = 10
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

// Cursor 기반 (대규모, 무한스크롤)
const { data } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', cursor) // 커서 이전 데이터
  .limit(PAGE_SIZE)
```

### 필터링 & 검색
```typescript
// 다중 조건
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('is_published', true)
  .eq('category_id', categoryId)
  .gte('created_at', startDate)
  .lte('created_at', endDate)

// 텍스트 검색 (ILIKE)
const { data } = await supabase
  .from('posts')
  .select('*')
  .ilike('title', `%${keyword}%`)

// Full-text 검색 (성능 좋음, 설정 필요)
const { data } = await supabase
  .from('posts')
  .select('*')
  .textSearch('title_content', keyword)

// OR 조건
const { data } = await supabase
  .from('posts')
  .select('*')
  .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)

// IN 조건
const { data } = await supabase
  .from('posts')
  .select('*')
  .in('category_id', [1, 2, 3])
```

---

## 5. 인증 패턴

### OAuth 로그인 (카카오, 구글 등)
```typescript
// 로그인 시작
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'kakao', // 'google', 'github' 등
  options: {
    redirectTo: `${origin}/auth/callback`,
  },
})

// 로그아웃
await supabase.auth.signOut()

// 현재 유저 가져오기 (서버)
const { data: { user } } = await supabase.auth.getUser()

// 세션 가져오기 (클라이언트)
const { data: { session } } = await supabase.auth.getSession()
```

### 이메일/비밀번호 인증
```typescript
// 회원가입
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { nickname }, // 추가 메타데이터
  },
})

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### 인증 콜백 라우트 (필수)
```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

### 인증 상태 확인 유틸
```typescript
// src/lib/supabase/auth.ts
import { createClient } from './server'
import { redirect } from 'next/navigation'

// 인증 필수 페이지에서 사용
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

// 비로그인 전용 페이지에서 사용 (로그인/회원가입)
export async function requireGuest() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/')
  }
}
```

---

## 6. 에러 처리 패턴

### Server Actions에서
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function createPost(formData: FormData): Promise<ActionResult<Post>> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
```

### 클라이언트에서
```typescript
const result = await createPost(formData)

if (!result.success) {
  toast.error(result.error)
  return
}

toast.success('게시글이 작성되었습니다')
router.push(`/posts/${result.data.id}`)
```

---

## 7. 타입 안전성

### 타입 생성 및 활용
```bash
# 타입 생성
pnpm gen:types
```
```typescript
// src/types/database.types.ts (자동 생성됨)
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: { ... }      // SELECT 결과
        Insert: { ... }   // INSERT 입력
        Update: { ... }   // UPDATE 입력
      }
    }
  }
}

// 사용
import { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
```

### 타입 헬퍼
```typescript
// src/types/supabase.ts
import { Database } from './database.types'

// 테이블 Row 타입 추출
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// 사용 예시
type Post = Tables<'posts'>
type PostInsert = TablesInsert<'posts'>
```

---

## 8. 파일 구조
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts      # 브라우저용 클라이언트
│       ├── server.ts      # 서버용 클라이언트
│       ├── middleware.ts  # 미들웨어용 클라이언트
│       └── auth.ts        # 인증 유틸 (requireAuth 등)
├── types/
│   ├── database.types.ts  # 자동 생성 (수정 X)
│   └── supabase.ts        # 타입 헬퍼
├── actions/
│   ├── auth.ts            # 인증 관련 액션
│   ├── posts.ts           # 게시글 CRUD 액션
│   └── ...
└── app/
    └── auth/
        └── callback/
            └── route.ts   # OAuth 콜백
```

---

## 9. 체크리스트

새 테이블 추가 시:
- [ ] 테이블 생성 SQL 작성
- [ ] RLS 활성화 및 정책 설정
- [ ] updated_at 트리거 연결
- [ ] 타입 재생성 (`pnpm gen:types`)
- [ ] 필요시 SUPABASE.md 업데이트

새 기능 구현 시:
- [ ] 올바른 클라이언트 선택 (server/client)
- [ ] 에러 처리 포함
- [ ] 타입 적용
- [ ] RLS 정책으로 보안 확인
```

---

이 `SUPABASE_RULES.md`를 프로젝트 루트에 두면, Claude Code가 Supabase 관련 작업을 할 때 일관된 패턴으로 코드를 생성해줄 거야.

**사용 예시:**
```
"posts 테이블 CRUD Server Actions 만들어줘"
→ Claude Code가 SUPABASE_RULES.md 참고해서
→ 올바른 클라이언트 사용
→ 에러 처리 패턴 적용
→ 타입 안전한 코드 생성