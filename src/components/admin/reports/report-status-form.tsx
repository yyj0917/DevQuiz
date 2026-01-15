'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateReportStatusAction } from '@/app/(admin)/admin/reports/actions';
import type { ReportStatus } from '@/lib/constants/report';

type ReportStatusFormProps = {
  reportId: string;
  currentStatus: ReportStatus;
  currentAdminNote: string;
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '대기' },
  { value: 'reviewed', label: '검토중' },
  { value: 'resolved', label: '해결' },
  { value: 'rejected', label: '반려' },
];

export function ReportStatusForm({
  reportId,
  currentStatus,
  currentAdminNote,
}: ReportStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ReportStatus>(currentStatus);
  const [adminNote, setAdminNote] = useState(currentAdminNote);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateReportStatusAction(
          reportId,
          status,
          adminNote.trim() || undefined
        );

        if (result.success) {
          alert('상태가 변경되었습니다.');
          router.refresh();
        } else {
          setError(result.error || '상태 변경에 실패했습니다.');
        }
      } catch (err) {
        setError('상태 변경 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as ReportStatus)}>
          <SelectTrigger id="status">
            <SelectValue />
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
        <Label htmlFor="adminNote">관리자 메모</Label>
        <Textarea
          id="adminNote"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="처리 내용을 입력하세요..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? '변경 중...' : '상태 변경'}
      </Button>
    </form>
  );
}
