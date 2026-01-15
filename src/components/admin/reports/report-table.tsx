'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReportStatusBadge } from './report-status-badge';
import { REPORT_TYPES } from '@/lib/constants/report';

type Report = {
  id: string;
  type: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  created_at: string;
  question?: {
    id: string;
    question: string;
    type: string;
  };
  user?: {
    id: string;
    nickname: string;
    email: string;
  };
};

type ReportTableProps = {
  reports: Report[];
};

export function ReportTable({ reports }: ReportTableProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">신고가 없습니다.</div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>신고 유형</TableHead>
            <TableHead>문제</TableHead>
            <TableHead>신고자</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>신고일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell>
                <Link
                  href={`/admin/reports/${report.id}`}
                  className="text-blue-600 hover:underline font-mono text-xs"
                >
                  {report.id.slice(0, 8)}
                </Link>
              </TableCell>
              <TableCell>
                {REPORT_TYPES[report.type as keyof typeof REPORT_TYPES]}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {report.question ? (
                  <Link
                    href={`/admin/questions/${report.question.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {report.question.question}
                  </Link>
                ) : (
                  <span className="text-gray-400">삭제된 문제</span>
                )}
              </TableCell>
              <TableCell>
                {report.user ? (
                  <div>
                    <div className="font-medium">{report.user.nickname}</div>
                    <div className="text-xs text-gray-500">{report.user.email}</div>
                  </div>
                ) : (
                  <span className="text-gray-400">탈퇴한 사용자</span>
                )}
              </TableCell>
              <TableCell>
                <ReportStatusBadge status={report.status} />
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
