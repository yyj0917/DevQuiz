import { createClient } from '@/lib/supabase/client';
import type { Question } from '@/types/database';

export interface GenerateCategoryQuizParams {
  userId: string;
  categoryId: string | null; // null = random quiz (all categories)
  mode: 'random' | 'wrong_only';
  count: number;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get wrong questions for a user (optionally filtered by category)
 */
async function getWrongQuestions(
  userId: string,
  categoryId: string | null
): Promise<Question[]> {
  const supabase = await createClient();

  let query = supabase
    .from('wrong_notes')
    .select('question_id, questions(*)')
    .eq('user_id', userId)
    .eq('is_reviewed', false);

  if (categoryId) {
    query = query.eq('questions.category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching wrong questions:', error);
    return [];
  }

  // Extract questions from wrong_notes
  return (data || [])
    .map((wn: any) => wn.questions)
    .filter((q: any) => q !== null) as Question[];
}

/**
 * Generate category quiz questions
 */
export async function generateCategoryQuiz(
  params: GenerateCategoryQuizParams
): Promise<Question[]> {
  const { userId, categoryId, mode, count } = params;
  const supabase = await createClient();

  // Mode: wrong_only
  if (mode === 'wrong_only') {
    const wrongQuestions = await getWrongQuestions(userId, categoryId);

    if (wrongQuestions.length === 0) {
      // If no wrong questions, fall back to random mode
      return generateCategoryQuiz({
        ...params,
        mode: 'random',
      });
    }

    return shuffle(wrongQuestions).slice(0, count);
  }

  // Mode: random
  let query = supabase
    .from('questions')
    .select('*')
    .eq('is_active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: questions, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // Shuffle and return requested count
  return shuffle(questions).slice(0, Math.min(count, questions.length));
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * Get total question count for a category (or all categories)
 */
export async function getCategoryQuestionCount(
  categoryId: string | null
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting questions:', error);
    return 0;
  }

  return count || 0;
}
