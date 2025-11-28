import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const TableDemo = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">ID</TableHead>
        <TableHead>이름</TableHead>
        <TableHead>이메일</TableHead>
        <TableHead className="text-right">상태</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">1</TableCell>
        <TableCell>홍길동</TableCell>
        <TableCell>hong@example.com</TableCell>
        <TableCell className="text-right">활성</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">2</TableCell>
        <TableCell>김철수</TableCell>
        <TableCell>kim@example.com</TableCell>
        <TableCell className="text-right">활성</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">3</TableCell>
        <TableCell>이영희</TableCell>
        <TableCell>lee@example.com</TableCell>
        <TableCell className="text-right">비활성</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const meta = {
  title: 'UI/Table',
  component: TableDemo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TableDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
