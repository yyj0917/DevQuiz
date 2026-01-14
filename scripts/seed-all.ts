import seedCategories from './seed-categories';
import seedQuestions from './seed-questions';
import 'dotenv/config';

async function seedAll() {
  console.log('🚀 Starting database seeding...\n');
  console.log('=' .repeat(60));
  console.log();

  const startTime = Date.now();

  try {
    // Step 1: Seed categories
    console.log('STEP 1: Categories');
    console.log('-'.repeat(60));
    await seedCategories();

    // Step 2: Seed questions
    console.log('STEP 2: Questions');
    console.log('-'.repeat(60));
    await seedQuestions();

    // Done
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('=' .repeat(60));
    console.log(`✅ All seeding completed successfully in ${duration}s!`);
    console.log('=' .repeat(60));
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedAll();
