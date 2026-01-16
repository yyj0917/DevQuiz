'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminEmail } from '@/lib/constants/admin';
import type { ReportStatus } from '@/lib/constants/report';
import type {
  GetReportsResult,
  GetReportByIdResult,
  UpdateReportStatusResult,
  GetReportStatsResult,
  ReportWithDetails,
} from '@/types/actions';
import type { QuestionReport } from '@/types/database';

// 어드민 권한 체크
async function checkAdminAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    throw new Error('Unauthorized');
  }

  return { supabase, user };
}

// 신고 목록 조회
export async function getReportsAction(params: {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  type?: string;
  sortBy?: 'newest' | 'oldest';
}): Promise<GetReportsResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { page = 1, limit = 20, status, type, sortBy = 'newest' } = params;

    let query = supabase
      .from('question_reports')
      .select(
        `
        *,
        question:questions(
          id,
          question,
          type,
          difficulty,
          categories(name)
        ),
        user:profiles(id, nickname, email)
      `,
        { count: 'exact' }
      );

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    query = query.order('created_at', { ascending: sortBy === 'oldest' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      reports: (data || []) as ReportWithDetails[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('getReportsAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

// 신고 상세 조회
export async function getReportByIdAction(id: string): Promise<GetReportByIdResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { data, error } = await supabase
      .from('question_reports')
      .select(
        `
        *,
        question:questions(
          id,
          question,
          type,
          difficulty,
          options,
          answer,
          explanation,
          code_snippet,
          categories(id, name, slug)
        ),
        user:profiles(id, nickname, email)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return { success: true, report: data as ReportWithDetails };
  } catch (error) {
    console.error('getReportByIdAction error:', error);
    return { success: false, error: '권한이 없습니다.' };
  }
}

// 신고 상태 변경
export async function updateReportStatusAction(
  id: string,
  status: ReportStatus,
  adminNote?: string
): Promise<UpdateReportStatusResult> {
  try {
    const { supabase, user } = await checkAdminAuth();

    type UpdateData = {
      status: ReportStatus;
      admin_note: string | null;
      resolved_at?: string | null;
      resolved_by?: string | null;
    };

    const updateData: UpdateData = {
      status,
      admin_note: adminNote || null,
    };

    if (status === 'resolved' || status === 'rejected') {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    } else {
      updateData.resolved_at = null;
      updateData.resolved_by = null;
    }

    const { error } = await ((supabase
      .from('question_reports') as any)
      .update(updateData)
      .eq('id', id));

    if (error) throw error;

    revalidatePath('/admin/reports');
    revalidatePath(`/admin/reports/${id}`);

    return { success: true, data: null };
  } catch (error) {
    console.error('updateReportStatusAction error:', error);
    return { success: false, error: '상태 변경에 실패했습니다.' };
  }
}

// 신고 통계
export async function getReportStatsAction(): Promise<GetReportStatsResult> {
  try {
    const { supabase } = await checkAdminAuth();

    const { data: statusCounts } = await supabase
      .from('question_reports')
      .select('status');

    type StatusData = { status: ReportStatus };
    const statusData = (statusCounts as StatusData[] | null) || [];
    
    const stats = {
      total: statusData.length,
      pending: statusData.filter((r) => r.status === 'pending').length,
      reviewed: statusData.filter((r) => r.status === 'reviewed').length,
      resolved: statusData.filter((r) => r.status === 'resolved').length,
      rejected: statusData.filter((r) => r.status === 'rejected').length,
    };

    return { success: true, stats };
  } catch (error) {
    console.error('getReportStatsAction error:', error);
    return { success: false, error: '통계를 가져오는데 실패했습니다.' };
  }
}
