import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportStatusBadge } from '@/components/admin/reports/report-status-badge';
import { ReportStatusForm } from '@/components/admin/reports/report-status-form';
import { getReportByIdAction } from '../actions';
import { REPORT_TYPES } from '@/lib/constants/report';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;

  const result = (await getReportByIdAction(id)) as any;

  if (!result.success || !result.report) {
    notFound();
  }

  const report = result.report;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">신고 상세</h1>
            <p className="text-gray-500 mt-1">신고 ID: {report.id}</p>
          </div>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 신고 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>신고 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">신고 유형</div>
                <div className="font-medium">
                  {REPORT_TYPES[report.type as keyof typeof REPORT_TYPES]}
                </div>
              </div>

              {report.description && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">상세 설명</div>
                  <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {report.description}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-500 mb-1">신고 일시</div>
                <div className="font-medium">
                  {new Date(report.created_at).toLocaleString('ko-KR')}
                  <span className="text-gray-500 text-sm ml-2">
                    (
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                    )
                  </span>
                </div>
              </div>

              {(report.status === 'resolved' || report.status === 'rejected') &&
                report.resolved_at && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">처리 일시</div>
                    <div className="font-medium">
                      {new Date(report.resolved_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* 신고된 문제 */}
          {report.question && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>신고된 문제</CardTitle>
                  <Link href={`/admin/questions/${report.question.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      문제 보기
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">문제</div>
                  <div className="font-medium whitespace-pre-wrap">
                    {report.question.question}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">유형</div>
                    <div className="font-medium">{report.question.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">난이도</div>
                    <div className="font-medium">{report.question.difficulty}</div>
                  </div>
                </div>

                {report.question.categories && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">카테고리</div>
                    <div className="font-medium">{report.question.categories.name}</div>
                  </div>
                )}

                {report.question.options && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">선택지</div>
                    <div className="space-y-2">
                      {report.question.options.map((option: string, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded">
                          {idx + 1}. {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.question.answer && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">정답</div>
                    <div className="font-medium">{report.question.answer}</div>
                  </div>
                )}

                {report.question.explanation && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">해설</div>
                    <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {report.question.explanation}
                    </div>
                  </div>
                )}

                {report.question.code_snippet && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">코드</div>
                    <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                      <code>{report.question.code_snippet}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* 신고자 정보 */}
          {report.user && (
            <Card>
              <CardHeader>
                <CardTitle>신고자</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">닉네임</div>
                  <div className="font-medium">{report.user.nickname}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">이메일</div>
                  <div className="font-medium text-sm">{report.user.email}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 상태 변경 */}
          <Card>
            <CardHeader>
              <CardTitle>상태 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportStatusForm
                reportId={report.id}
                currentStatus={report.status}
                currentAdminNote={report.admin_note || ''}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
