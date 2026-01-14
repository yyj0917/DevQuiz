import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categories = [
  {
    name: '자료구조',
    slug: 'data-structure',
    description: '배열, 리스트, 스택, 큐, 트리, 그래프 등 기본 자료구조',
    icon: '🏗️',
    order_index: 1,
  },
  {
    name: '알고리즘',
    slug: 'algorithm',
    description: '정렬, 탐색, 동적 프로그래밍, 그리디 등 핵심 알고리즘',
    icon: '⚡',
    order_index: 2,
  },
  {
    name: '운영체제',
    slug: 'os',
    description: '프로세스, 스레드, 메모리 관리, 파일 시스템',
    icon: '🖥️',
    order_index: 3,
  },
  {
    name: '네트워크',
    slug: 'network',
    description: 'TCP/IP, HTTP, OSI 7계층, 네트워크 보안',
    icon: '🌐',
    order_index: 4,
  },
  {
    name: '데이터베이스',
    slug: 'database',
    description: 'SQL, 정규화, 트랜잭션, 인덱스, 쿼리 최적화',
    icon: '🗄️',
    order_index: 5,
  },
];

async function seedCategories() {
  console.log('📦 Starting category seeding...\n');

  try {
    // Check existing categories
    const { data: existing, error: fetchError } = await supabase
      .from('categories')
      .select('slug');

    if (fetchError) {
      throw fetchError;
    }

    const existingSlugs = new Set(existing?.map((c) => c.slug) || []);

    // Filter out categories that already exist
    const newCategories = categories.filter(
      (cat) => !existingSlugs.has(cat.slug)
    );

    if (newCategories.length === 0) {
      console.log('✅ All categories already exist. Skipping insertion.\n');
      return;
    }

    // Insert new categories
    const { data, error } = await supabase
      .from('categories')
      .insert(newCategories)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} categories:\n`);
    data?.forEach((cat) => {
      console.log(`   ${cat.icon} ${cat.name} (${cat.slug})`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('🎉 Category seeding completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedCategories;
