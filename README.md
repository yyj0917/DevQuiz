# Next.js 프로젝트 템플릿

바이브 코딩을 위한 Next.js 프로젝트 기본 세팅 템플릿입니다. 최신 기술 스택과 모범 사례를 적용하여 빠르게 프로젝트를 시작할 수 있도록 구성되어 있습니다.

## 🚀 기술 스택

- **Next.js 16.1.1** - App Router 기반의 최신 Next.js
- **TypeScript** - 타입 안정성을 위한 TypeScript
- **Tailwind CSS v4** - 유틸리티 퍼스트 CSS 프레임워크
- **Shadcn/ui** - New York 스타일의 고품질 UI 컴포넌트
- **Supabase** - 인증 및 데이터베이스 백엔드
- **Zod** - 스키마 기반 타입 안전 검증
- **React Hook Form** - 성능 최적화된 폼 관리
- **React Compiler** - 자동 최적화를 위한 React Compiler 활성화
- **pnpm** - 빠르고 효율적인 패키지 매니저

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지 및 라우팅
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   ├── (pages)/           # 실제 페이지 라우트 그룹
│   ├── api/               # API Routes
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # Shadcn UI 컴포넌트
│   └── common/           # 공통 컴포넌트
├── lib/                  # 유틸리티 및 라이브러리
│   ├── supabase/         # Supabase 클라이언트 설정
│   │   ├── client.ts     # 클라이언트 컴포넌트용
│   │   └── server.ts     # 서버 컴포넌트/Actions용
│   ├── utils.ts          # 유틸리티 함수
│   └── validations/      # Zod 스키마
├── actions/              # Server Actions
├── types/                # TypeScript 타입 정의
│   └── database.types.ts # Supabase 타입 정의
├── hooks/                # Custom React Hooks
└── constants/            # 상수 정의
```

## 🛠️ 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 타입 생성

Supabase 프로젝트 ID를 설정한 후 다음 명령어를 실행하세요:

```bash
pnpm gen:types
```

또는 `package.json`의 `gen:types` 스크립트에서 `YOUR_PROJECT_ID`를 실제 프로젝트 ID로 변경한 후 실행하세요.

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📝 코딩 컨벤션

### 네이밍 규칙

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **함수/변수**: camelCase (예: `getUserData`, `isLoading`)
- **파일명**: kebab-case (예: `user-profile.tsx`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`)

### 파일 구조 규칙

- **Server Actions**: `src/actions/` 디렉토리에 위치
- **커스텀 컴포넌트**: `src/components/` 디렉토리에 위치
- **Shadcn UI 컴포넌트**: `src/components/ui/` 디렉토리에 위치
- **폼 검증 스키마**: `src/lib/validations/` 디렉토리에 위치
- **타입 정의**: `src/types/` 디렉토리에 위치

## 🎨 UI 컴포넌트 사용법

### Shadcn UI 컴포넌트 추가

새로운 Shadcn UI 컴포넌트를 추가하려면:

```bash
pnpm dlx shadcn@latest add [component-name]
```

예시:
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
```

### Tailwind CSS 유틸리티

`cn()` 함수를 사용하여 조건부 클래스를 병합하세요:

```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class")} />
```

## 🔐 Supabase 사용법

### 클라이언트 컴포넌트에서 사용

```typescript
'use client'

import { createClient } from "@/lib/supabase/client"

export function ClientComponent() {
  const supabase = createClient()
  // Supabase 클라이언트 사용
}
```

### 서버 컴포넌트/Server Actions에서 사용

```typescript
import { createClient } from "@/lib/supabase/server"

export async function ServerComponent() {
  const supabase = await createClient()
  // Supabase 클라이언트 사용
}
```

자세한 Supabase 사용 가이드는 `SUPABASE_RULES.md`를 참고하세요.

## 📋 폼 처리 패턴

React Hook Form과 Zod를 함께 사용하는 권장 패턴:

```typescript
'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

type FormValues = z.infer<typeof formSchema>

export function LoginForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    const supabase = createClient()
    // 폼 제출 로직
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 폼 필드 */}
    </form>
  )
}
```

## ⚡ 성능 최적화 가이드

### Server Components 우선 사용

- 가능한 한 Server Components를 사용하세요
- `'use client'`는 클라이언트 상호작용이 필요한 경우에만 사용하세요

### 동적 임포트

큰 컴포넌트나 라이브러리는 동적 임포트를 사용하세요:

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### 이미지 최적화

Next.js Image 컴포넌트를 사용하세요:

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // 또는 loading="lazy"
/>
```

## 🧪 개발 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# Supabase 타입 생성
pnpm gen:types
```

## 📚 주요 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Shadcn UI 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React Hook Form 문서](https://react-hook-form.com)
- [Zod 문서](https://zod.dev)

## 🔧 설정 파일

- `next.config.ts` - Next.js 설정 (React Compiler 활성화)
- `tsconfig.json` - TypeScript 설정 (경로 별칭: `@/*`)
- `components.json` - Shadcn UI 설정
- `eslint.config.mjs` - ESLint 설정
- `postcss.config.mjs` - PostCSS 설정 (Tailwind CSS v4)

## 💡 베스트 프랙티스

1. **타입 안정성**: TypeScript를 적극 활용하여 타입 안정성을 확보하세요
2. **에러 처리**: 모든 비동기 작업에 적절한 에러 처리를 구현하세요
3. **조기 반환**: Guard clause 패턴을 사용하여 중첩을 줄이세요
4. **검증**: 사용자 입력은 Zod 스키마로 검증하세요
5. **보안**: 환경 변수는 절대 클라이언트에 노출하지 마세요
6. **성능**: 불필요한 리렌더링을 방지하고 Server Components를 우선 사용하세요

## 📝 라이선스

이 템플릿은 프로젝트 시작을 위한 기본 설정입니다. 자유롭게 수정하여 사용하세요.
