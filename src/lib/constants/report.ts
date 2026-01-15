// 신고 유형
export const REPORT_TYPES = {
  question_error: '문제에 오류가 있다',
  option_error: '선택지에 오류가 있다',
  answer_mismatch: '정답과 설명이 다르다',
  explanation_error: '설명이 틀렸다',
} as const;

export type ReportType = keyof typeof REPORT_TYPES;

// 신고 상태
export const REPORT_STATUS = {
  pending: '대기 중',
  reviewed: '검토 중',
  resolved: '해결됨',
  rejected: '반려됨',
} as const;

export type ReportStatus = keyof typeof REPORT_STATUS;

// 신고 유형 옵션 (다이얼로그용)
export const REPORT_OPTIONS: {
  value: ReportType;
  label: string;
  description: string;
}[] = [
  {
    value: 'question_error',
    label: '문제에 오류가 있다',
    description: '문제 내용이 잘못되었거나 이해하기 어려움',
  },
  {
    value: 'option_error',
    label: '선택지에 오류가 있다',
    description: '선택지 내용이 잘못되었거나 중복됨',
  },
  {
    value: 'answer_mismatch',
    label: '정답과 설명이 다르다',
    description: '표시된 정답과 해설의 내용이 일치하지 않음',
  },
  {
    value: 'explanation_error',
    label: '설명이 틀렸다',
    description: '해설 내용이 부정확하거나 오류가 있음',
  },
];
