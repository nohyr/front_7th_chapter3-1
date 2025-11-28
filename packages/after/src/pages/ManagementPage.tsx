import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import type { User } from '../services/userService';
import type { Post } from '../services/postService';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  createUserSchema,
  updateUserSchema,
  createPostSchema,
  updatePostSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  type CreatePostFormData,
  type UpdatePostFormData,
} from '../schemas/validationSchemas';

type EntityType = 'user' | 'post';
type Entity = User | Post;

export const ManagementPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>('post');
  const [data, setData] = useState<Entity[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Entity | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // React Hook Form for User Create
  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'user',
      status: 'active',
    },
  });

  // React Hook Form for User Update
  const updateUserForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'user',
      status: 'active',
    },
  });

  // React Hook Form for Post Create
  const createPostForm = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      author: '',
      category: 'development',
      status: 'draft',
    },
  });

  // React Hook Form for Post Update
  const updatePostForm = useForm<UpdatePostFormData>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      title: '',
      content: '',
      author: '',
      category: 'development',
      status: 'draft',
    },
  });

  useEffect(() => {
    loadData();
    // Reset all forms when entity type changes
    createUserForm.reset();
    updateUserForm.reset();
    createPostForm.reset();
    updatePostForm.reset();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  }, [entityType]);

  const loadData = async () => {
    try {
      let result: Entity[];

      if (entityType === 'user') {
        result = await userService.getAll();
      } else {
        result = await postService.getAll();
      }

      setData(result);
    } catch (error: any) {
      setErrorMessage('데이터를 불러오는데 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      await userService.create(data);
      await loadData();
      setIsCreateModalOpen(false);
      createUserForm.reset();
      setAlertMessage('사용자가 생성되었습니다');
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '생성에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleCreatePost = async (data: CreatePostFormData) => {
    try {
      await postService.create(data);
      await loadData();
      setIsCreateModalOpen(false);
      createPostForm.reset();
      setAlertMessage('게시글이 생성되었습니다');
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '생성에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleEdit = (item: Entity) => {
    setSelectedItem(item);

    if (entityType === 'user') {
      const user = item as User;
      updateUserForm.reset({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      const post = item as Post;
      updatePostForm.reset({
        title: post.title,
        content: post.content,
        author: post.author,
        category: post.category as 'development' | 'design' | 'accessibility',
        status: post.status as 'draft' | 'published' | 'archived',
      });
    }

    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (data: UpdateUserFormData) => {
    if (!selectedItem) return;

    try {
      await userService.update(selectedItem.id, data);
      await loadData();
      setIsEditModalOpen(false);
      updateUserForm.reset();
      setSelectedItem(null);
      setAlertMessage('사용자가 수정되었습니다');
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '수정에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleUpdatePost = async (data: UpdatePostFormData) => {
    if (!selectedItem) return;

    try {
      await postService.update(selectedItem.id, data);
      await loadData();
      setIsEditModalOpen(false);
      updatePostForm.reset();
      setSelectedItem(null);
      setAlertMessage('게시글이 수정되었습니다');
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '수정에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (entityType === 'user') {
        await userService.delete(id);
      } else {
        await postService.delete(id);
      }

      await loadData();
      setAlertMessage('삭제되었습니다');
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '삭제에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleStatusAction = async (id: number, action: 'publish' | 'archive' | 'restore') => {
    if (entityType !== 'post') return;

    try {
      if (action === 'publish') {
        await postService.publish(id);
      } else if (action === 'archive') {
        await postService.archive(id);
      } else if (action === 'restore') {
        await postService.restore(id);
      }

      await loadData();
      const message =
        action === 'publish' ? '게시' :
        action === 'archive' ? '보관' :
        '복원';
      setAlertMessage(`${message}되었습니다`);
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || '작업에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const getStats = () => {
    if (entityType === 'user') {
      const users = data as User[];
      return {
        total: users.length,
        stat1: { label: '활성', value: users.filter(u => u.status === 'active').length },
        stat2: { label: '비활성', value: users.filter(u => u.status === 'inactive').length },
        stat3: { label: '정지', value: users.filter(u => u.status === 'suspended').length },
        stat4: { label: '관리자', value: users.filter(u => u.role === 'admin').length },
      };
    } else {
      const posts = data as Post[];
      return {
        total: posts.length,
        stat1: { label: '게시됨', value: posts.filter(p => p.status === 'published').length },
        stat2: { label: '임시저장', value: posts.filter(p => p.status === 'draft').length },
        stat3: { label: '보관됨', value: posts.filter(p => p.status === 'archived').length },
        stat4: { label: '총 조회수', value: posts.reduce((sum, p) => sum + p.views, 0) },
      };
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { variant: 'default', label: '활성' },
      inactive: { variant: 'secondary', label: '비활성' },
      suspended: { variant: 'destructive', label: '정지' },
      published: { variant: 'default', label: '게시됨' },
      draft: { variant: 'secondary', label: '임시저장' },
      archived: { variant: 'outline', label: '보관됨' },
    };
    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">관리 시스템</h1>
          <p className="text-muted-foreground">사용자와 게시글을 관리하세요</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-2 border-b pb-4">
              <Button
                variant={entityType === 'post' ? 'default' : 'outline'}
                onClick={() => setEntityType('post')}
              >
                게시글
              </Button>
              <Button
                variant={entityType === 'user' ? 'default' : 'outline'}
                onClick={() => setEntityType('user')}
              >
                사용자
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateModalOpen(true)}>새로 만들기</Button>
            </div>

            {showSuccessAlert && (
              <Alert className="relative">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>성공</AlertTitle>
                <AlertDescription>{alertMessage}</AlertDescription>
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                  ×
                </button>
              </Alert>
            )}

            {showErrorAlert && (
              <Alert variant="destructive" className="relative">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
                <button
                  onClick={() => setShowErrorAlert(false)}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                  ×
                </button>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>전체</CardDescription>
                  <CardTitle className="text-3xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{stats.stat1.label}</CardDescription>
                  <CardTitle className="text-3xl">{stats.stat1.value}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{stats.stat2.label}</CardDescription>
                  <CardTitle className="text-3xl">{stats.stat2.value}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{stats.stat3.label}</CardDescription>
                  <CardTitle className="text-3xl">{stats.stat3.value}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{stats.stat4.label}</CardDescription>
                  <CardTitle className="text-3xl">{stats.stat4.value}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {entityType === 'user' ? (
                      <>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>사용자명</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>생성일</TableHead>
                        <TableHead>마지막 로그인</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      {entityType === 'user' ? (
                        <>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{(item as User).username}</TableCell>
                          <TableCell>{(item as User).email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{(item as User).role}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge((item as User).status)}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                          <TableCell>{(item as User).lastLogin || '-'}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{(item as Post).title}</TableCell>
                          <TableCell>{(item as Post).author}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{(item as Post).category}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge((item as Post).status)}</TableCell>
                          <TableCell>{(item as Post).views}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              수정
                            </Button>
                            {(item as Post).status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusAction(item.id, 'publish')}
                              >
                                게시
                              </Button>
                            )}
                            {(item as Post).status === 'published' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusAction(item.id, 'archive')}
                              >
                                보관
                              </Button>
                            )}
                            {(item as Post).status === 'archived' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusAction(item.id, 'restore')}
                              >
                                복원
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 {entityType === 'user' ? '사용자' : '게시글'} 만들기</DialogTitle>
          </DialogHeader>
          {entityType === 'user' ? (
            <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자명 *</Label>
                <Input
                  id="username"
                  {...createUserForm.register('username')}
                  placeholder="사용자명을 입력하세요"
                />
                {createUserForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {createUserForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  {...createUserForm.register('email')}
                  placeholder="이메일을 입력하세요"
                />
                {createUserForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {createUserForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">역할</Label>
                  <Controller
                    name="role"
                    control={createUserForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">사용자</SelectItem>
                          <SelectItem value="moderator">운영자</SelectItem>
                          <SelectItem value="admin">관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  <Controller
                    name="status"
                    control={createUserForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="inactive">비활성</SelectItem>
                          <SelectItem value="suspended">정지</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">생성</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={createPostForm.handleSubmit(handleCreatePost)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  {...createPostForm.register('title')}
                  placeholder="게시글 제목을 입력하세요"
                />
                {createPostForm.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {createPostForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">작성자 *</Label>
                  <Input
                    id="author"
                    {...createPostForm.register('author')}
                    placeholder="작성자명"
                  />
                  {createPostForm.formState.errors.author && (
                    <p className="text-sm text-destructive">
                      {createPostForm.formState.errors.author.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Controller
                    name="category"
                    control={createPostForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="accessibility">Accessibility</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {createPostForm.formState.errors.category && (
                    <p className="text-sm text-destructive">
                      {createPostForm.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  {...createPostForm.register('content')}
                  placeholder="게시글 내용을 입력하세요"
                  rows={6}
                />
                {createPostForm.formState.errors.content && (
                  <p className="text-sm text-destructive">
                    {createPostForm.formState.errors.content.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">생성</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{entityType === 'user' ? '사용자' : '게시글'} 수정</DialogTitle>
            {selectedItem && (
              <DialogDescription>
                ID: {selectedItem.id} | 생성일: {selectedItem.createdAt}
                {entityType === 'post' && ` | 조회수: ${(selectedItem as Post).views}`}
              </DialogDescription>
            )}
          </DialogHeader>
          {entityType === 'user' ? (
            <form onSubmit={updateUserForm.handleSubmit(handleUpdateUser)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">사용자명 *</Label>
                <Input
                  id="edit-username"
                  {...updateUserForm.register('username')}
                  placeholder="사용자명을 입력하세요"
                />
                {updateUserForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {updateUserForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">이메일 *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...updateUserForm.register('email')}
                  placeholder="이메일을 입력하세요"
                />
                {updateUserForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {updateUserForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">역할</Label>
                  <Controller
                    name="role"
                    control={updateUserForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">사용자</SelectItem>
                          <SelectItem value="moderator">운영자</SelectItem>
                          <SelectItem value="admin">관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">상태</Label>
                  <Controller
                    name="status"
                    control={updateUserForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="inactive">비활성</SelectItem>
                          <SelectItem value="suspended">정지</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">수정 완료</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={updatePostForm.handleSubmit(handleUpdatePost)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">제목 *</Label>
                <Input
                  id="edit-title"
                  {...updatePostForm.register('title')}
                  placeholder="게시글 제목을 입력하세요"
                />
                {updatePostForm.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {updatePostForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-author">작성자 *</Label>
                  <Input
                    id="edit-author"
                    {...updatePostForm.register('author')}
                    placeholder="작성자명"
                  />
                  {updatePostForm.formState.errors.author && (
                    <p className="text-sm text-destructive">
                      {updatePostForm.formState.errors.author.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">카테고리 *</Label>
                  <Controller
                    name="category"
                    control={updatePostForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="accessibility">Accessibility</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {updatePostForm.formState.errors.category && (
                    <p className="text-sm text-destructive">
                      {updatePostForm.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">내용</Label>
                <Textarea
                  id="edit-content"
                  {...updatePostForm.register('content')}
                  placeholder="게시글 내용을 입력하세요"
                  rows={6}
                />
                {updatePostForm.formState.errors.content && (
                  <p className="text-sm text-destructive">
                    {updatePostForm.formState.errors.content.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">수정 완료</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
