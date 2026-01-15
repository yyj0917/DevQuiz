'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REPORT_OPTIONS } from '@/lib/constants/report';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'reviewed', label: '검토중' },
  { value: 'resolved', label: '해결' },
  { value: 'rejected', label: '반려' },
];

export function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete('page');
    router.push(`/admin/reports?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>상태</Label>
        <Select
          value={searchParams.get('status') || 'all'}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>신고 유형</Label>
        <Select
          value={searchParams.get('type') || 'all'}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {REPORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>정렬</Label>
        <Select
          value={searchParams.get('sortBy') || 'newest'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="정렬 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
