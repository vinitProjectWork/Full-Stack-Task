/**
 * Seed script — populates the Square Sandbox catalog with sample restaurant menu items.
 * Creates categories first, then assigns every item to a category.
 *
 * Usage:  npx tsx src/scripts/seed-catalog.ts
 */
import '../config/env.js';
import axios from 'axios';
import { env } from '../config/env.js';
import { randomUUID } from 'node:crypto';

const api = axios.create({
  baseURL: env.SQUARE_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': '2024-12-18',
  },
  timeout: 30_000,
});

interface SeedVariation {
  name: string;
  priceCents: number;
}

interface SeedItem {
  name: string;
  description: string;
  variations: SeedVariation[];
}

interface SeedCategory {
  categoryName: string;
  items: SeedItem[];
}

const MENU: SeedCategory[] = [
  {
    categoryName: 'Appetizers',
    items: [
      {
        name: 'Crispy Spring Rolls',
        description: 'Golden-fried vegetable spring rolls served with sweet chili dipping sauce.',
        variations: [{ name: 'Regular', priceCents: 850 }],
      },
      {
        name: 'Bruschetta',
        description: 'Toasted ciabatta topped with diced tomatoes, fresh basil, garlic, and balsamic glaze.',
        variations: [{ name: 'Regular', priceCents: 950 }],
      },
      {
        name: 'Soup of the Day',
        description: "Chef's daily creation served with artisan bread.",
        variations: [
          { name: 'Cup', priceCents: 600 },
          { name: 'Bowl', priceCents: 900 },
        ],
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted sourdough bread with roasted garlic butter and herbs.',
        variations: [
          { name: 'Regular', priceCents: 550 },
          { name: 'With Cheese', priceCents: 750 },
        ],
      },
      {
        name: 'Loaded Nachos',
        description: 'Tortilla chips piled high with cheddar, jalapeños, sour cream, and guacamole.',
        variations: [
          { name: 'Half', priceCents: 850 },
          { name: 'Full', priceCents: 1250 },
        ],
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, vine-ripened tomatoes, basil, and aged balsamic reduction.',
        variations: [{ name: 'Regular', priceCents: 1050 }],
      },
    ],
  },
  {
    categoryName: 'Mains',
    items: [
      {
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with aged cheddar, lettuce, tomato, pickles, and signature sauce on a brioche bun.',
        variations: [
          { name: 'Single', priceCents: 1450 },
          { name: 'Double', priceCents: 1850 },
        ],
      },
      {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon fillet with lemon-dill butter, roasted vegetables, and wild rice pilaf.',
        variations: [{ name: 'Regular', priceCents: 2200 }],
      },
      {
        name: 'Margherita Pizza',
        description: 'Wood-fired pizza with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil.',
        variations: [
          { name: 'Personal (10")', priceCents: 1200 },
          { name: 'Large (14")', priceCents: 1800 },
        ],
      },
      {
        name: 'Chicken Caesar Salad',
        description: 'Grilled chicken breast over crisp romaine with house-made Caesar dressing, parmesan, and garlic croutons.',
        variations: [{ name: 'Regular', priceCents: 1350 }],
      },
      {
        name: 'Pasta Carbonara',
        description: 'Spaghetti with pancetta, egg yolk, pecorino romano, and cracked black pepper. A Roman classic.',
        variations: [{ name: 'Regular', priceCents: 1600 }],
      },
      {
        name: 'BBQ Pulled Pork Sandwich',
        description: 'Slow-smoked pulled pork with tangy BBQ sauce, coleslaw, and pickles on a toasted bun.',
        variations: [{ name: 'Regular', priceCents: 1500 }],
      },
      {
        name: 'Teriyaki Chicken Bowl',
        description: 'Grilled teriyaki chicken over steamed jasmine rice with stir-fried vegetables and sesame seeds.',
        variations: [{ name: 'Regular', priceCents: 1400 }],
      },
      {
        name: 'Fish and Chips',
        description: 'Beer-battered Atlantic cod with thick-cut fries, mushy peas, and tartar sauce.',
        variations: [{ name: 'Regular', priceCents: 1650 }],
      },
      {
        name: 'Veggie Stir Fry',
        description: 'Seasonal vegetables wok-tossed in ginger-soy glaze, served with steamed brown rice.',
        variations: [{ name: 'Regular', priceCents: 1250 }],
      },
    ],
  },
  {
    categoryName: 'Pasta & Noodles',
    items: [
      {
        name: 'Penne Arrabbiata',
        description: 'Penne pasta in spicy tomato sauce with garlic, chili flakes, and fresh parsley.',
        variations: [{ name: 'Regular', priceCents: 1300 }],
      },
      {
        name: 'Fettuccine Alfredo',
        description: 'Fettuccine in a rich and creamy parmesan alfredo sauce.',
        variations: [
          { name: 'Regular', priceCents: 1400 },
          { name: 'With Chicken', priceCents: 1750 },
        ],
      },
      {
        name: 'Pad Thai',
        description: 'Rice noodles with shrimp, tofu, bean sprouts, peanuts, and tamarind sauce.',
        variations: [{ name: 'Regular', priceCents: 1550 }],
      },
      {
        name: 'Lasagna Bolognese',
        description: 'Layers of pasta, slow-cooked beef ragù, béchamel, and melted mozzarella.',
        variations: [{ name: 'Regular', priceCents: 1600 }],
      },
    ],
  },
  {
    categoryName: 'Desserts',
    items: [
      {
        name: 'Tiramisu',
        description: 'Layers of espresso-soaked ladyfingers and mascarpone cream dusted with cocoa.',
        variations: [{ name: 'Regular', priceCents: 1000 }],
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla bean ice cream.',
        variations: [{ name: 'Regular', priceCents: 1100 }],
      },
      {
        name: 'New York Cheesecake',
        description: 'Rich and creamy cheesecake with a graham cracker crust, topped with berry compote.',
        variations: [{ name: 'Regular', priceCents: 1050 }],
      },
      {
        name: 'Crème Brûlée',
        description: 'Classic vanilla custard with a caramelized sugar crust.',
        variations: [{ name: 'Regular', priceCents: 950 }],
      },
      {
        name: 'Gelato Selection',
        description: 'Three scoops of house-made Italian gelato. Ask for today\'s flavors.',
        variations: [
          { name: '1 Scoop', priceCents: 450 },
          { name: '3 Scoops', priceCents: 1000 },
        ],
      },
    ],
  },
  {
    categoryName: 'Drinks',
    items: [
      {
        name: 'Fresh Lemonade',
        description: 'House-squeezed lemonade with a hint of mint.',
        variations: [
          { name: 'Regular', priceCents: 450 },
          { name: 'Large', priceCents: 600 },
        ],
      },
      {
        name: 'Espresso',
        description: 'Double shot of premium Italian espresso.',
        variations: [{ name: 'Regular', priceCents: 350 }],
      },
      {
        name: 'Iced Tea',
        description: 'Cold-brewed black tea served over ice with a lemon wedge.',
        variations: [{ name: 'Regular', priceCents: 400 }],
      },
      {
        name: 'Mango Smoothie',
        description: 'Blended fresh mango, yogurt, and honey over ice.',
        variations: [{ name: 'Regular', priceCents: 650 }],
      },
      {
        name: 'Hot Chocolate',
        description: 'Rich Belgian chocolate melted into steamed milk, topped with whipped cream.',
        variations: [
          { name: 'Regular', priceCents: 500 },
          { name: 'Large', priceCents: 650 },
        ],
      },
    ],
  },
  {
    categoryName: 'Sides',
    items: [
      {
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with sea salt. Add truffle oil for an upgrade.',
        variations: [
          { name: 'Regular', priceCents: 450 },
          { name: 'Truffle', priceCents: 700 },
        ],
      },
      {
        name: 'Sweet Potato Fries',
        description: 'Lightly salted and served with chipotle aioli.',
        variations: [{ name: 'Regular', priceCents: 550 }],
      },
      {
        name: 'Garden Salad',
        description: 'Mixed greens, cherry tomatoes, cucumber, red onion, and balsamic vinaigrette.',
        variations: [{ name: 'Regular', priceCents: 500 }],
      },
      {
        name: 'Onion Rings',
        description: 'Beer-battered onion rings with smoky ranch dipping sauce.',
        variations: [{ name: 'Regular', priceCents: 600 }],
      },
      {
        name: 'Coleslaw',
        description: 'Creamy house-made coleslaw with apple cider vinegar dressing.',
        variations: [{ name: 'Regular', priceCents: 350 }],
      },
    ],
  },
];

async function clearExistingCatalog() {
  console.log('  Clearing existing catalog objects...');
  let cursor: string | undefined;
  const ids: string[] = [];

  do {
    const body: Record<string, unknown> = {
      object_types: ['ITEM', 'CATEGORY'],
      limit: 100,
    };
    if (cursor) body.cursor = cursor;

    const { data } = await api.post('/catalog/search', body);
    if (data.objects) {
      for (const obj of data.objects) {
        ids.push(obj.id);
      }
    }
    cursor = data.cursor;
  } while (cursor);

  if (ids.length > 0) {
    await api.post('/catalog/batch-delete', {
      object_ids: ids,
    });
    console.log(`  Deleted ${ids.length} existing objects.`);
  } else {
    console.log('  No existing objects to delete.');
  }
}

async function seed() {
  console.log('Seeding Square Sandbox catalog...\n');

  await clearExistingCatalog();

  const objects: Record<string, unknown>[] = [];
  const categoryIds = new Map<string, string>();

  // 1. Create CATEGORY objects
  for (const group of MENU) {
    const catId = `#cat-${group.categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and')}`;
    categoryIds.set(group.categoryName, catId);

    objects.push({
      type: 'CATEGORY',
      id: catId,
      present_at_all_locations: true,
      category_data: { name: group.categoryName },
    });
  }

  // 2. Create ITEM objects with category references
  for (const group of MENU) {
    const catId = categoryIds.get(group.categoryName)!;

    for (const item of group.items) {
      const itemId = `#item-${randomUUID().slice(0, 8)}`;

      objects.push({
        type: 'ITEM',
        id: itemId,
        present_at_all_locations: true,
        item_data: {
          name: item.name,
          description: item.description,
          // Both fields for maximum compatibility across Square API versions
          category_id: catId,
          categories: [{ id: catId }],
          reporting_category: { id: catId },
          variations: item.variations.map((v) => ({
            type: 'ITEM_VARIATION',
            id: `#var-${randomUUID().slice(0, 8)}`,
            present_at_all_locations: true,
            item_variation_data: {
              item_id: itemId,
              name: v.name,
              pricing_type: 'FIXED_PRICING',
              price_money: {
                amount: v.priceCents,
                currency: 'USD',
              },
            },
          })),
        },
      });
    }
  }

  const totalItems = MENU.reduce((sum, g) => sum + g.items.length, 0);
  console.log(`\n  Upserting ${objects.length} objects (${MENU.length} categories, ${totalItems} items)...`);

  const { data } = await api.post('/catalog/batch-upsert', {
    idempotency_key: randomUUID(),
    batches: [{ objects }],
  });

  const mapped = data.objects ?? [];
  const cats = mapped.filter((o: { type: string }) => o.type === 'CATEGORY');
  const items = mapped.filter((o: { type: string }) => o.type === 'ITEM');

  console.log(`  Created ${mapped.length} objects in Square.\n`);
  console.log('  Summary:');
  console.log(`    Categories: ${cats.length}`);
  console.log(`    Items:      ${items.length}`);

  // Show per-category breakdown
  console.log('\n  Per-category breakdown:');
  for (const group of MENU) {
    console.log(`    ${group.categoryName}: ${group.items.length} items`);
  }

  console.log('\nDone! Restart your dev server to clear the cache and see the new menu.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.response?.data ?? err.message);
  process.exit(1);
});
