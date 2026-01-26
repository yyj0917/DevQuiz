'use server';

import { createClient } from '@/lib/supabase/server';
import { subMonths, format, parseISO } from 'date-fns';
import type {
  DailyActivity,
  CategoryStat,
  DayActivityDetail,
  ActivityQuestion,
  ActivitySummary,
  CategorySummary,
} from '@/types/stats';
import type { ActionResult } from '@/types/actions';

/**
 * Get activity data for the last N months
 */
export async function getActivityData(
  months: number = 12
): Promise<ActionResult<{ activities: DailyActivity[]; summary: ActivitySummary; categorySummaries: CategorySummary[] }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    const startDateStr = format(startDate, 'yyyy-MM-dd');

    // First, get user's quiz attempt IDs
    type AttemptData = { id: string };
    const { data: userAttempts, error: attemptsError } = (await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id)) as { data: AttemptData[] | null; error: unknown };

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError);
      return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
    }

    // Get user's category quiz attempt IDs
    const { data: userCategoryAttempts, error: categoryAttemptsError } = (await supabase
      .from('category_quiz_attempts')
      .select('id')
      .eq('user_id', user.id)) as { data: AttemptData[] | null; error: unknown };

    if (categoryAttemptsError) {
      console.error('Error fetching category attempts:', categoryAttemptsError);
      return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
    }

    const attemptIds = (userAttempts || []).map((a) => a.id);
    const categoryAttemptIds = (userCategoryAttempts || []).map((a) => a.id);

    // Fetch quiz answers with question and category information
    // Filter by user's attempt IDs
    let answersQuery = supabase
      .from('quiz_answers')
      .select(
        `
        id,
        is_correct,
        answered_at,
        attempt_id,
        category_attempt_id,
        questions (
          id,
          category_id,
          categories (
            id,
            name,
            slug,
            icon
          )
        )
      `
      )
      .gte('answered_at', startDateStr)
      .not('questions', 'is', null)
      .order('answered_at', { ascending: false });

    // Filter by attempt_id OR category_attempt_id
    if (attemptIds.length > 0 && categoryAttemptIds.length > 0) {
      answersQuery = answersQuery.or(`attempt_id.in.(${attemptIds.join(',')}),category_attempt_id.in.(${categoryAttemptIds.join(',')})`);
    } else if (attemptIds.length > 0) {
      answersQuery = answersQuery.in('attempt_id', attemptIds);
    } else if (categoryAttemptIds.length > 0) {
      answersQuery = answersQuery.in('category_attempt_id', categoryAttemptIds);
    } else {
      // No attempts found
      return {
        success: true,
        data: {
          activities: [],
          summary: {
            totalQuestions: 0,
            currentStreak: 0,
            longestStreak: 0,
            activeDays: 0,
            totalDays: 0,
          },
          categorySummaries: [],
        },
      };
    }

    const { data: answers, error: answersError } = await answersQuery;

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
    }

    // If no answers, return empty data
    if (!answers || answers.length === 0) {
      return {
        success: true,
        data: {
          activities: [],
          summary: {
            totalQuestions: 0,
            currentStreak: 0,
            longestStreak: 0,
            activeDays: 0,
            totalDays: 0,
          },
          categorySummaries: [],
        },
      };
    }

    // Group by date and category
    type AnswerWithCategory = {
      id: string;
      is_correct: boolean;
      answered_at: string;
      questions: {
        id: string;
        category_id: string;
        categories: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        } | null;
      } | null;
    };

    const activitiesMap = new Map<string, DailyActivity>();

    (answers as AnswerWithCategory[]).forEach((answer) => {
      const dateKey = format(parseISO(answer.answered_at), 'yyyy-MM-dd');
      const question = answer.questions;
      const category = question?.categories;

      if (!activitiesMap.has(dateKey)) {
        activitiesMap.set(dateKey, {
          date: dateKey,
          totalQuestions: 0,
          correctCount: 0,
          accuracy: 0,
          categories: [],
        });
      }

      const activity = activitiesMap.get(dateKey)!;
      activity.totalQuestions++;
      if (answer.is_correct) {
        activity.correctCount++;
      }

      // Group by category
      if (category) {
        const existingCat = activity.categories.find(c => c.categoryId === category.id);
        if (existingCat) {
          existingCat.count++;
          if (answer.is_correct) {
            existingCat.correctCount++;
          }
        } else {
          activity.categories.push({
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug,
            categoryIcon: category.icon,
            count: 1,
            correctCount: answer.is_correct ? 1 : 0,
          });
        }
      }
    });

    // Calculate accuracy for each activity
    activitiesMap.forEach((activity) => {
      activity.accuracy = activity.totalQuestions > 0
        ? Math.round((activity.correctCount / activity.totalQuestions) * 100)
        : 0;
    });

    const activities = Array.from(activitiesMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate summary statistics
    const totalQuestions = activities.reduce((sum, a) => sum + a.totalQuestions, 0);
    const activeDays = activities.length;

    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = activities
      .map((a) => a.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = format(new Date(), 'yyyy-MM-dd');
    if (sortedDates.length > 0) {
      const latestDate = sortedDates[0];
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate category summaries
    const categoryTotalsMap = new Map<string, CategorySummary>();
    activities.forEach((activity) => {
      activity.categories.forEach((cat) => {
        if (!categoryTotalsMap.has(cat.categoryId)) {
          categoryTotalsMap.set(cat.categoryId, {
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            categorySlug: cat.categorySlug,
            categoryIcon: cat.categoryIcon,
            totalQuestions: 0,
            correctCount: 0,
            accuracy: 0,
          });
        }

        const catSummary = categoryTotalsMap.get(cat.categoryId)!;
        catSummary.totalQuestions += cat.count;
        catSummary.correctCount += cat.correctCount;
      });
    });

    const categorySummaries = Array.from(categoryTotalsMap.values()).map((cat) => ({
      ...cat,
      accuracy: cat.totalQuestions > 0 ? Math.round((cat.correctCount / cat.totalQuestions) * 100) : 0,
    })).sort((a, b) => b.totalQuestions - a.totalQuestions); // Sort by total questions descending

    return {
      success: true,
      data: {
        activities,
        summary: {
          totalQuestions,
          currentStreak,
          longestStreak,
          activeDays,
          totalDays,
        },
        categorySummaries,
      },
    };
  } catch (error) {
    console.error('getActivityData error:', error);
    return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
  }
}

/**
 * Get detailed activity for a specific day
 */
export async function getDayActivityDetail(
  date: string
): Promise<ActionResult<DayActivityDetail>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    // Calculate date range for the specific day
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    // First, get user's quiz attempt IDs
    type AttemptData = { id: string };
    const { data: userAttempts, error: attemptsError } = (await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id)) as { data: AttemptData[] | null; error: unknown };

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError);
      return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
    }

    // Get user's category quiz attempt IDs
    const { data: userCategoryAttempts, error: categoryAttemptsError } = (await supabase
      .from('category_quiz_attempts')
      .select('id')
      .eq('user_id', user.id)) as { data: AttemptData[] | null; error: unknown };

    if (categoryAttemptsError) {
      console.error('Error fetching category attempts:', categoryAttemptsError);
      return { success: false, error: '활동 데이터를 불러오는데 실패했습니다' };
    }

    const attemptIds = (userAttempts || []).map((a) => a.id);
    const categoryAttemptIds = (userCategoryAttempts || []).map((a) => a.id);

    if (attemptIds.length === 0 && categoryAttemptIds.length === 0) {
      return { success: false, error: '해당 날짜의 활동을 찾을 수 없습니다' };
    }

    // Get answers with full question details for the specific date
    let answersQuery = supabase
      .from('quiz_answers')
      .select(
        `
        id,
        user_answer,
        is_correct,
        answered_at,
        attempt_id,
        category_attempt_id,
        questions (
          id,
          question,
          answer,
          type,
          difficulty,
          category_id,
          categories (
            id,
            name,
            slug,
            icon
          )
        )
      `
      )
      .gte('answered_at', startOfDay)
      .lte('answered_at', endOfDay)
      .not('questions', 'is', null)
      .order('answered_at', { ascending: true });

    // Filter by attempt_id OR category_attempt_id
    if (attemptIds.length > 0 && categoryAttemptIds.length > 0) {
      answersQuery = answersQuery.or(`attempt_id.in.(${attemptIds.join(',')}),category_attempt_id.in.(${categoryAttemptIds.join(',')})`);
    } else if (attemptIds.length > 0) {
      answersQuery = answersQuery.in('attempt_id', attemptIds);
    } else if (categoryAttemptIds.length > 0) {
      answersQuery = answersQuery.in('category_attempt_id', categoryAttemptIds);
    }

    const { data: answers, error: answersError } = await answersQuery;

    if (answersError) {
      console.error('Error fetching answer details:', answersError);
      return { success: false, error: '문제 상세 정보를 불러오는데 실패했습니다' };
    }

    if (!answers || answers.length === 0) {
      return { success: false, error: '해당 날짜의 활동을 찾을 수 없습니다' };
    }

    type AnswerDetail = {
      id: string;
      user_answer: string;
      is_correct: boolean;
      answered_at: string;
      questions: {
        id: string;
        question: string;
        answer: string;
        type: 'multiple' | 'ox' | 'blank' | 'code';
        difficulty: number;
        category_id: string;
        categories: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        } | null;
      } | null;
    };

    // Build category stats
    const categoryMap = new Map<string, CategoryStat>();
    let totalQuestions = 0;
    let correctCount = 0;

    (answers as AnswerDetail[]).forEach((answer) => {
      totalQuestions++;
      if (answer.is_correct) {
        correctCount++;
      }

      const question = answer.questions;
      const category = question?.categories;

      if (category) {
        const catId = category.id;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            categoryId: catId,
            categoryName: category.name,
            categorySlug: category.slug,
            categoryIcon: category.icon,
            count: 0,
            correctCount: 0,
          });
        }

        const catStat = categoryMap.get(catId)!;
        catStat.count++;
        if (answer.is_correct) {
          catStat.correctCount++;
        }
      }
    });

    const categories = Array.from(categoryMap.values());
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const summary: DailyActivity = {
      date,
      totalQuestions,
      correctCount,
      accuracy,
      categories,
    };

    const questions: ActivityQuestion[] = (answers as AnswerDetail[]).map((answer) => {
      const q = answer.questions;
      const category = q?.categories;

      return {
        id: q?.id || '',
        question: q?.question || '',
        categoryName: category?.name || 'Unknown',
        categoryIcon: category?.icon || null,
        type: q?.type || 'multiple',
        difficulty: q?.difficulty || 1,
        isCorrect: answer.is_correct,
        userAnswer: answer.user_answer,
        correctAnswer: q?.answer || '',
      };
    });

    return {
      success: true,
      data: {
        summary,
        questions,
      },
    };
  } catch (error) {
    console.error('getDayActivityDetail error:', error);
    return { success: false, error: '상세 정보를 불러오는데 실패했습니다' };
  }
}
