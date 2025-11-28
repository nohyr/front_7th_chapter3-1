# Chapter3-1 과제 회고

## 과제를 시작하며

이번 과제는 Before 패키지의 레거시 디자인 시스템을 shadcn/ui 기반의 현대적인 시스템으로 마이그레이션하는 것이었다. 처음 Before 패키지를 열었을 때 느낀 건 "이게 실무에서 정말 많이 보던 코드구나"였다. 인라인 스타일 하드코딩, any 타입 남발, 컴포넌트에 섞인 비즈니스 로직... 뭔가 익숙한 느낌이었다.

과제 요구사항은 명확했다:
- shadcn/ui + TailwindCSS로 UI 컴포넌트 구축
- CVA로 variant 패턴 적용
- React Hook Form + Zod로 폼 검증
- Storybook 문서화
- Dark Mode 지원

하지만 막상 시작하려니 "어디서부터 손대야 하지?"라는 생각이 먼저 들었다.

## shadcn/ui를 처음 접하다

### "이게 라이브러리가 아니라고?"

shadcn/ui를 처음 접했을 때 가장 당황스러웠던 건, 이게 npm 패키지가 아니라는 점이었다. 보통 UI 라이브러리는 `npm install` 하면 node_modules에 들어가는데, shadcn/ui는 CLI로 컴포넌트를 설치하면 소스 코드가 내 프로젝트의 `src/components/ui/`에 직접 복사된다.

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
```

처음엔 "이게 맞나? 버전 관리는 어떻게 하지?" 싶었는데, 막상 써보니 이 방식이 주는 자유도가 엄청났다. 컴포넌트 코드를 직접 수정할 수 있으니까 커스터마이징이 정말 자유롭다. Material-UI나 Ant Design 쓸 때는 스타일 덮어쓰기로 삽질했던 기억이 떠올랐다.

### Radix UI의 접근성

shadcn/ui가 Radix UI 기반이라는 걸 알고 Dialog나 Select 컴포넌트 코드를 열어봤는데, ARIA 속성이 정말 빈틈없이 들어가 있었다. `aria-label`, `aria-describedby`, 키보드 네비게이션... 접근성을 직접 구현하려면 얼마나 신경 써야 하는지 알기에, 이게 기본으로 제공된다는 게 큰 장점이었다.

## TailwindCSS와의 첫 만남 (그리고 좌절)

### v4의 함정

"최신 버전이 좋겠지" 하고 TailwindCSS v4를 설치했는데, 빌드가 안 돌아갔다.

```
It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package...
```

v4에서는 PostCSS 플러그인 구조가 완전히 바뀌어서 `@tailwindcss/postcss`를 별도로 설치해야 했다. 공식 문서 보면서 설정을 이것저것 바꿔봤지만 계속 오류가 났다. 결국 "일단 되는 걸로 하자" 하고 v3.4로 다운그레이드했다.

```bash
npm install tailwindcss@^3.4.0 --save-dev --legacy-peer-deps
```

이 경험을 통해 배운 건, 프로덕션 프로젝트에서는 "안정성 > 최신 기능"이라는 것이다. 특히 빌드 도구 쪽은 더 보수적으로 가야 한다는 걸 깨달았다.

### 디자인 토큰 시스템 구축

TailwindCSS 설정을 하면서 Before 패키지의 하드코딩된 색상 값들을 정리했다. `#f0f0f0`, `#333`, `#007bff` 이런 값들이 여기저기 흩어져 있었는데, 이걸 CSS Variables로 토큰화했다.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}
```

처음엔 "왜 RGB나 HEX가 아니라 HSL로 쓰지?" 싶었는데, Dark Mode 때문이었다. HSL로 정의하면 밝기 값만 바꿔서 다크 테마를 만들기 쉽다. 실제로 `.dark` 클래스에서 같은 색상의 밝기만 조정해서 다크 모드를 구현할 수 있었다.

## CVA 패턴 적용기

### Variants를 선언적으로 정의하다

Button 컴포넌트를 만들면서 CVA를 처음 써봤다. Before 패키지에서는 이런 식이었다:

```tsx
const getButtonStyle = (variant: string) => {
  if (variant === 'primary') return { backgroundColor: '#007bff', color: 'white' };
  if (variant === 'secondary') return { backgroundColor: '#6c757d' };
  // ...
}
```

CVA로 바꾸니 이렇게 깔끔해졌다:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

특히 좋았던 건 TypeScript와의 통합이다. `VariantProps<typeof buttonVariants>`를 쓰면 variant와 size의 타입이 자동으로 추론된다. "destructiv" 같은 오타를 치면 컴파일 타임에 잡아준다. 이게 바로 타입 안전성의 힘이구나 싶었다.

## React Hook Form + Zod: 가장 많이 배운 부분

### 처음의 막막함

Before 패키지에서 폼은 이렇게 관리되고 있었다:

```tsx
const [formData, setFormData] = useState<any>({});
```

any 타입... 뭐가 들어있는지도 모르고, 유효성 검사는 handleCreate 함수 안에서 if 문으로 하나하나 체크한다. 이걸 React Hook Form + Zod로 바꿔야 하는데, 둘을 어떻게 연결하는지 감이 안 왔다.

### Zod 스키마로 타입과 검증을 한번에

먼저 Zod로 검증 스키마를 만들었다:

```tsx
export const createUserSchema = z.object({
  username: z
    .string()
    .min(2, '사용자명은 최소 2자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 입력 가능합니다')
    .regex(/^[a-zA-Z0-9가-힣_]+$/, '영문, 한글, 숫자, 언더스코어만 가능합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role: z.enum(['user', 'moderator', 'admin']),
  status: z.enum(['active', 'inactive', 'suspended']),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
```

여기서 포인트는 `z.infer`다. Zod 스키마에서 TypeScript 타입을 자동으로 추론해준다. 검증 규칙과 타입 정의를 한곳에서 관리할 수 있다는 게 정말 편했다.

### .default()의 함정

처음엔 Zod 스키마에 기본값까지 넣으려고 했다:

```tsx
role: z.enum(['user', 'moderator', 'admin']).default('user')
```

그런데 이렇게 하면 타입이 optional로 추론되면서 TypeScript 오류가 났다. 결국 기본값은 useForm의 defaultValues에서 관리하는 게 맞다는 걸 알았다:

```tsx
const form = useForm<CreateUserFormData>({
  resolver: zodResolver(createUserSchema),
  defaultValues: {
    username: '',
    email: '',
    role: 'user',
    status: 'active',
  },
});
```

이 경험을 통해 "Zod는 검증 규칙만, 기본값은 폼 상태에서" 라는 역할 분리를 배웠다.

### Radix UI Select와 Controller

가장 애먹었던 부분이 여기다. Input 컴포넌트는 간단하게 `register`만 하면 됐다:

```tsx
<Input {...form.register('username')} />
```

그런데 shadcn/ui의 Select는 Radix UI 기반이라 내부 구조가 복잡해서 register가 안 먹힌다. 한참 삽질하다가 React Hook Form 문서를 뒤져서 `Controller`를 찾았다:

```tsx
<Controller
  name="role"
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger>
        <SelectValue placeholder="역할 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">사용자</SelectItem>
        <SelectItem value="moderator">운영자</SelectItem>
        <SelectItem value="admin">관리자</SelectItem>
      </SelectContent>
    </Select>
  )}
/>
```

Controller는 외부 UI 라이브러리를 React Hook Form과 연결해주는 어댑터 역할을 한다. 이걸 이해하고 나니 Radix UI 기반 컴포넌트들을 모두 통합할 수 있었다.

## Atomic Design에 대한 고민

### 이론과 실무의 괴리

처음에는 "컴포넌트 설계는 Atomic Design이지!" 하고 열심히 atoms/molecules/organisms 폴더를 만들었다. Button은 atom, FormInput은 molecule... 그런데 컴포넌트를 분류하다 보니 "이게 도대체 어디에 속하지?" 싶은 게 너무 많았다.

Card 컴포넌트는 atom인가 molecule인가? Header, Content, Footer를 가질 수 있으니 organism? 근데 단독으로도 쓰이는데? 이런 고민에 시간을 너무 많이 쓰고 있는 내 모습을 보고 "이건 아닌 것 같은데"라는 생각이 들었다.

### shadcn/ui의 단순함

shadcn/ui 저장소를 들어가서 폴더 구조를 봤는데, 그냥 `components/ui/`에 전부 평평하게 들어가 있었다. atoms도 molecules도 없이 그냥 button.tsx, input.tsx, card.tsx...

"이렇게 단순해도 되나?" 싶었는데, 막상 이렇게 바꾸니까 개발 속도가 확 빨라졌다. 컴포넌트 찾기도 쉽고, import 경로도 짧고, 뭔가 분류 기준 때문에 고민할 필요가 없었다.

이 경험을 통해 배운 건, 이론은 이론일 뿐이고 실무에서는 **실용성**이 우선이라는 것이다. Atomic Design이 나쁜 게 아니라, 소규모 프로젝트에는 오버엔지니어링일 수 있다는 걸 깨달았다.

## Storybook으로 컴포넌트 문서화

Storybook은 예전에 써본 적이 있어서 큰 어려움은 없었다. 각 컴포넌트마다 stories 파일을 만들고:

```tsx
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};
```

막상 만들고 나니, Storybook이 있으니까 컴포넌트를 격리된 환경에서 테스트할 수 있어서 좋았다. 특히 Dark Mode 토글을 누르면서 컴포넌트들이 제대로 테마가 바뀌는지 확인할 수 있었던 게 유용했다.

## Dark Mode 구현

ThemeProvider를 만들면서 생각보다 신경 써야 할 게 많았다. localStorage에 테마 저장, system 테마 감지, 초기 렌더링 시 깜빡임 방지...

특히 초기 렌더링 때 라이트 모드로 잠깐 보였다가 다크 모드로 바뀌는 "flash" 문제를 해결하는 게 까다로웠다. useEffect보다 먼저 실행되도록 동기적으로 처리해야 했다.

```tsx
useEffect(() => {
  const root = window.document.documentElement
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light"
    root.classList.add(systemTheme)
    return
  }

  root.classList.add(theme)
}, [theme])
```

## 가장 많이 배운 것들

### 1. 디자인 시스템의 가치

Before 패키지를 보면서 "디자인 시스템이 없으면 이렇게 되는구나"를 체감했다. 같은 primary 색상인데 `#007bff`, `#0066cc`, `#0056b3` 다 다르게 쓰이고 있고, 버튼마다 패딩이 제각각이고... 이걸 디자인 토큰으로 통일하니까 일관성이 확 잡혔다.

디자인 시스템은 단순히 "예쁜 UI"를 위한 게 아니라, **유지보수 가능한 코드**를 위한 거라는 걸 깨달았다.

### 2. 타입 안전성이 주는 안정감

TypeScript + Zod + CVA를 함께 쓰면서 타입 안전성의 가치를 제대로 느꼈다. 컴파일 타임에 오류를 잡아주니까, 런타임 에러를 걱정할 필요가 없었다. 특히 리팩토링할 때 안심하고 코드를 바꿀 수 있었다.

any 타입을 쓰는 순간 TypeScript의 이점을 다 버리는 거라는 걸 다시 한번 느꼈다.

### 3. UI와 비즈니스 로직의 분리

Before 패키지에서 Button 컴포넌트가 `entityType === 'user'` 같은 도메인 지식을 갖고 있는 걸 보고 충격받았다. UI 컴포넌트가 비즈니스를 알면 재사용이 불가능해진다.

순수 UI 컴포넌트를 만들고, 비즈니스 로직은 페이지 레벨에서 처리하도록 바꾸니까 컴포넌트가 훨씬 재사용 가능해졌다. "관심사의 분리"가 왜 중요한지 몸으로 느꼈다.

### 4. 도구 선택의 중요성

TailwindCSS, shadcn/ui, React Hook Form, Zod... 이 도구들을 함께 쓰니까 시너지가 엄청났다. 각각이 독립적으로 좋은 도구지만, 함께 쓰면 더 강력해진다.

특히 shadcn/ui가 TailwindCSS + Radix UI + CVA를 조합해서 만들어졌다는 걸 알고, "좋은 도구는 여러 좋은 도구의 조합"이라는 걸 배웠다.

### 5. 실용성 vs 이론

Atomic Design 경험을 통해 "이론을 맹목적으로 따르면 안 된다"는 걸 배웠다. 이론은 방향성을 제시하지만, 프로젝트의 규모와 상황에 맞게 조정해야 한다.

작은 프로젝트에서 복잡한 패턴을 억지로 적용하면 오히려 생산성이 떨어진다. "Keep it simple"이 정답일 때가 많다.

## 아쉬운 점과 개선 방향

### 테스트 코드를 못 짠 게 아쉽다

시간 관계상 테스트 코드를 작성하지 못했다. React Hook Form + Zod로 만든 폼 검증 로직은 테스트하기 좋은 구조인데, 단위 테스트를 작성했으면 더 완성도 있었을 것 같다.

특히 Zod 스키마는 독립적으로 테스트할 수 있어서, 각 검증 규칙이 제대로 동작하는지 확인하는 테스트를 작성하면 좋았을 것 같다.

### 서버 상태 관리까지는 못 다뤘다

이번 과제는 UI 컴포넌트에 집중했지만, 실제 프로젝트에서는 서버 데이터 관리가 중요하다. Tanstack Query를 추가해서 서버 상태 관리를 개선하면 더 실무적인 프로젝트가 될 것 같다.

### Chromatic으로 비주얼 테스트

Storybook을 만들었으니, Chromatic을 연동해서 비주얼 회귀 테스트를 추가하면 좋을 것 같다. UI 변경을 시각적으로 리뷰할 수 있으면 더 안전하게 개발할 수 있다.

## 마치며

이번 과제는 "레거시 코드를 현대적으로 바꾸는 과정"을 경험할 수 있어서 정말 유익했다. 실무에서 마주칠 법한 문제들(any 타입, 하드코딩된 스타일, 비즈니스 로직 혼재)을 직접 리팩토링하면서, 왜 디자인 시스템이 필요한지, 타입 안전성이 왜 중요한지 몸으로 느낄 수 있었다.

특히 TailwindCSS v4 오류, Zod .default() 문제, Radix UI Select 통합 같은 삽질 경험들이 가장 많이 배운 부분이었다. 에러를 만나고, 문서를 뒤지고, 해결책을 찾아내는 그 과정에서 진짜 학습이 일어난다는 걸 다시 한번 깨달았다.

이제 shadcn/ui + TailwindCSS + React Hook Form + Zod 조합은 새 프로젝트 시작할 때 자신있게 쓸 수 있을 것 같다.
