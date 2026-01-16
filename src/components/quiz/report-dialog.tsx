'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitReportAction } from '@/app/(pages)/quiz/actions';
import { REPORT_OPTIONS, type ReportType } from '@/lib/constants/report';

interface ReportDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({
  questionId,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedType) {
      setError('신고 유형을 선택해주세요');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await submitReportAction({
          questionId,
          type: selectedType,
          description: description.trim() || null,
        });

        if (result.success) {
          alert('신고가 접수되었습니다. 검토 후 처리될 예정입니다.');
          onOpenChange(false);
          // 상태 초기화
          setSelectedType(null);
          setDescription('');
          setError(null);
        } else if ('duplicate' in result && result.duplicate) {
          alert('이미 동일한 신고를 접수하셨습니다.');
          onOpenChange(false);
        }
      } catch (error) {
        setError('신고 접수 중 오류가 발생했습니다');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            문제 신고
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <RadioGroup
            value={selectedType || ''}
            onValueChange={(value) => {
              setSelectedType(value as ReportType);
              setError(null);
            }}
            className="space-y-3"
          >
            {REPORT_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedType(option.value);
                  setError(null);
                }}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-4">
            <Label htmlFor="description" className="text-sm font-medium">
              추가 설명 (선택)
            </Label>
            <Textarea
              id="description"
              placeholder="구체적인 오류 내용을 적어주시면 검토에 도움이 됩니다..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !selectedType} className='bg-red-500 hover:bg-red-800'>
            {isPending ? '신고 중...' : '신고하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
