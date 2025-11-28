import { z } from 'zod';

// User 생성 스키마
export const createUserSchema = z.object({
  username: z
    .string()
    .min(2, '사용자명은 최소 2자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 입력 가능합니다')
    .regex(/^[a-zA-Z0-9가-힣_]+$/, '사용자명은 영문, 한글, 숫자, 언더스코어만 가능합니다'),
  email: z
    .string()
    .min(1, '이메일은 필수입니다')
    .email('올바른 이메일 형식이 아닙니다'),
  role: z.enum(['user', 'moderator', 'admin']),
  status: z.enum(['active', 'inactive', 'suspended']),
});

// User 수정 스키마
export const updateUserSchema = createUserSchema;

// Post 생성 스키마
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .min(5, '제목은 최소 5자 이상이어야 합니다')
    .max(100, '제목은 최대 100자까지 입력 가능합니다'),
  content: z
    .string()
    .max(5000, '내용은 최대 5000자까지 입력 가능합니다'),
  author: z
    .string()
    .min(1, '작성자는 필수입니다')
    .min(2, '작성자명은 최소 2자 이상이어야 합니다')
    .max(50, '작성자명은 최대 50자까지 입력 가능합니다'),
  category: z.enum(['development', 'design', 'accessibility'], {
    message: '카테고리를 선택해주세요',
  }),
  status: z.enum(['draft', 'published', 'archived']),
});

// Post 수정 스키마
export const updatePostSchema = createPostSchema;

// TypeScript 타입 추론
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
