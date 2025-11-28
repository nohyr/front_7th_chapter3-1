import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const SelectDemo = (args: any) => (
  <Select {...args}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="선택하세요" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">옵션 1</SelectItem>
      <SelectItem value="option2">옵션 2</SelectItem>
      <SelectItem value="option3">옵션 3</SelectItem>
    </SelectContent>
  </Select>
);

const meta = {
  title: 'UI/Select',
  component: SelectDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'option2',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
