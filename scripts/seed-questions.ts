import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuestionSeed {
  category: string; // slug
  type: 'multiple' | 'ox' | 'blank' | 'code';
  difficulty: number;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  code_snippet?: string;
  tags?: string[];
  source?: string;
}

interface QuestionInsert {
  category_id: string;
  type: string;
  difficulty: number;
  question: string;
  options?: any;
  answer: string;
  explanation?: string;
  code_snippet?: string;
  tags?: string[];
  source?: string;
}

async function getCategoryMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const map = new Map<string, string>();
  data?.forEach((cat) => {
    map.set(cat.slug, cat.id);
  });

  return map;
}

async function readQuestionFiles(questionsDir: string): Promise<QuestionSeed[]> {
  const allQuestions: QuestionSeed[] = [];

  // Read all category directories
  const categoryDirs = fs.readdirSync(questionsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`📂 Found ${categoryDirs.length} category directories\n`);

  for (const categoryDir of categoryDirs) {
    const categoryPath = path.join(questionsDir, categoryDir);
    const files = fs.readdirSync(categoryPath)
      .filter((file) => file.endsWith('.json'));

    console.log(`   ${categoryDir}: ${files.length} files`);

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(content);

        // Handle both single question and array of questions
        if (Array.isArray(questions)) {
          allQuestions.push(...questions);
        } else {
          allQuestions.push(questions);
        }
      } catch (error) {
        console.error(`   ❌ Error reading ${file}:`, error);
      }
    }
  }

  console.log();
  return allQuestions;
}

async function seedQuestions() {
  console.log('📦 Starting question seeding...\n');

  try {
    // 1. Get category ID mapping
    console.log('🔍 Fetching category mappings...');
    const categoryMap = await getCategoryMap();

    if (categoryMap.size === 0) {
      throw new Error('No categories found. Please run seed-categories first.');
    }

    console.log(`   Found ${categoryMap.size} categories\n`);

    // 2. Read all question files
    const questionsDir = path.join(process.cwd(), 'seeds', 'questions');
    const questionSeeds = await readQuestionFiles(questionsDir);

    console.log(`📊 Total questions loaded: ${questionSeeds.length}\n`);

    // 3. Check existing questions (to avoid duplicates)
    console.log('🔍 Checking existing questions...');
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('question');

    if (fetchError) {
      throw fetchError;
    }

    const existingQuestionTexts = new Set(
      existingQuestions?.map((q) => q.question) || []
    );
    console.log(`   Found ${existingQuestionTexts.size} existing questions\n`);

    // 4. Transform and filter questions
    const questionsToInsert: QuestionInsert[] = [];
    const skipped: string[] = [];
    const invalidCategory: string[] = [];

    for (const seed of questionSeeds) {
      // Check if question already exists
      if (existingQuestionTexts.has(seed.question)) {
        skipped.push(seed.question.substring(0, 50) + '...');
        continue;
      }

      // Get category ID
      const categoryId = categoryMap.get(seed.category);
      if (!categoryId) {
        invalidCategory.push(seed.category);
        continue;
      }

      // Transform to insert format
      questionsToInsert.push({
        category_id: categoryId,
        type: seed.type,
        difficulty: seed.difficulty,
        question: seed.question,
        options: seed.options ? seed.options : null,
        answer: seed.answer,
        explanation: seed.explanation,
        code_snippet: seed.code_snippet,
        tags: seed.tags,
        source: seed.source,
      });
    }

    // 5. Report statistics
    console.log('📈 Processing summary:');
    console.log(`   Total loaded: ${questionSeeds.length}`);
    console.log(`   Already exists (skipped): ${skipped.length}`);
    console.log(`   Invalid category (skipped): ${invalidCategory.length}`);
    console.log(`   Ready to insert: ${questionsToInsert.length}\n`);

    if (invalidCategory.length > 0) {
      console.warn('⚠️  Invalid categories found:', [...new Set(invalidCategory)]);
      console.log();
    }

    // 6. Insert questions in batches
    if (questionsToInsert.length === 0) {
      console.log('✅ No new questions to insert.\n');
      return;
    }

    console.log('💾 Inserting questions...');
    const BATCH_SIZE = 100;
    let insertedCount = 0;

    for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
      const batch = questionsToInsert.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('questions')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`   ❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        continue;
      }

      insertedCount += data?.length || 0;
      console.log(`   ✅ Batch ${i / BATCH_SIZE + 1}: ${data?.length} questions inserted`);
    }

    console.log();
    console.log(`🎉 Successfully inserted ${insertedCount} questions!\n`);

    // 7. Show category distribution
    console.log('📊 Questions by category:');
    const categoryCount = new Map<string, number>();

    for (const q of questionsToInsert) {
      const categorySlug = [...categoryMap.entries()]
        .find(([_, id]) => id === q.category_id)?.[0] || 'unknown';
      categoryCount.set(categorySlug, (categoryCount.get(categorySlug) || 0) + 1);
    }

    categoryCount.forEach((count, slug) => {
      console.log(`   ${slug}: ${count}`);
    });
    console.log();

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('🎉 Question seeding completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedQuestions;
