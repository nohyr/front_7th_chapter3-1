import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const DialogDemo = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">다이얼로그 열기</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>다이얼로그 제목</DialogTitle>
        <DialogDescription>
          다이얼로그 설명 텍스트입니다. 사용자에게 중요한 정보를 전달합니다.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p>다이얼로그 본문 내용</p>
      </div>
      <DialogFooter>
        <Button variant="outline">취소</Button>
        <Button>확인</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const meta = {
  title: 'UI/Dialog',
  component: DialogDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
