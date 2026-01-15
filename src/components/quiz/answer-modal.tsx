'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, AlertCircle, AlertTriangle } from 'lucide-react';
import { ReportDialog } from './report-dialog';
import type { QuizSubmissionResult } from '@/types/quiz';

type AnswerModalProps = {
  open: boolean;
  result: QuizSubmissionResult | null;
  isLastQuestion: boolean;
  questionId: string;
  onNext: () => void;
  onViewResults: () => void;
};

export function AnswerModal({
  open,
  result,
  isLastQuestion,
  questionId,
  onNext,
  onViewResults,
}: AnswerModalProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  if (!result) return null;

  const isCorrect = result.isCorrect;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isCorrect ? (
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl">
            {isCorrect ? '정답이에요! 🎉' : '아쉽네요 😔'}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isCorrect ? '훌륭합니다! 정확한 답변입니다.' : '다음에는 더 잘할 수 있을 거예요.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isCorrect && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">정답</p>
              <p className="text-base text-gray-900 font-semibold">{result.correctAnswerDisplay}</p>
            </div>
          )}

          {result.explanation && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-[#1e3a8a]">해설</p>
              <p className="text-base text-gray-900 leading-relaxed">{result.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-yellow-600"
            onClick={() => setReportDialogOpen(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            신고
          </Button>
        </div>

        <DialogFooter>
          {isLastQuestion ? (
            <Button
              onClick={onViewResults}
              className="w-full h-12 text-base rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              결과 페이지로
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="w-full h-12 text-base rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af]"
            >
              다음 문제
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <ReportDialog
        questionId={questionId}
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
    </Dialog>
  );
}
