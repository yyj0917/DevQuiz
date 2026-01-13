# 프로젝트명

## 기술 스택
- Next.js 16 (latest) (App Router)
- TypeScript
- TailwindCSS v4
- Shadcn/ui
- Supabase (인증, DB)
- Zod (검증)
- React Hook Form (폼)

## 프로젝트 구조
- `src/app/` - 페이지 및 라우팅
- `src/app/(auth)/` - 인증 관련 라우트 그룹
- `src/app/(pages)/` - 실제 page 라우트 그룹
- `src/app/api/` - API Routes
- `src/components/ui/` - Shadcn 컴포넌트
- `src/components/` - 커스텀 컴포넌트
- `src/components/common` - 자주 사용하는 컴포넌트
- `src/lib/supabase/` - Supabase 설정
- `src/lib/validations/` - Zod schema
- `src/actions/` - Server Actions
- `src/types/` - 타입 정의
- `src/hooks/` - custom hooks
- `src/constants/` - 상수

## 코딩 컨벤션
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 파일명: kebab-case
- Server Actions는 `src/actions/`에 위치
- 폼 검증은 Zod 스키마 사용

## Supabase 사용법
- 클라이언트 컴포넌트: `createClient()` from `@/lib/supabase/client`
- 서버 컴포넌트/Actions: `createClient()` from `@/lib/supabase/server`

## 주의사항
- 'use client'는 꼭 필요한 경우에만 사용
- 가능하면 Server Components 우선
- 폼은 React Hook Form + Zod resolver 패턴 사용

## 참고 문서
- Supabase 작업 시 `SUPABASE_RULES.md` 참고