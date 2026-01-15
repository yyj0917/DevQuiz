import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportFilters } from '@/components/admin/reports/report-filters';
import { ReportTable } from '@/components/admin/reports/report-table';
import Pagination from '@/components/admin/pagination';
import { getReportsAction, getReportStatsAction } from './actions';

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    type?: string;
    sortBy?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status;
  const type = params.type;
  const sortBy = (params.sortBy as 'newest' | 'oldest') || 'newest';

  const [reportsResult, statsResult] = (await Promise.all([
    getReportsAction({ page, limit: 20, status: status as any, type, sortBy }),
    getReportStatsAction(),
  ])) as [any, any];

  const reports = reportsResult.success ? reportsResult.reports : [];
  const total = reportsResult.success ? reportsResult.total : 0;
  const totalPages = reportsResult.success ? reportsResult.totalPages : 0;

  const stats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">신고 관리</h1>
        <p className="text-gray-500 mt-1">문제 신고를 관리합니다</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                전체 신고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                대기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                검토중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.reviewed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                해결
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                반려
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ReportFilters />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            신고 목록
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({total}건)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportTable reports={reports} />

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/admin/reports"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
