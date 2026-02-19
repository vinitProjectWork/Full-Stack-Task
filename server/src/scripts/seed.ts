/**
 * Master seed script — sets up a complete Square Sandbox environment in one run.
 *
 * Steps:
 *   1. Creates a new location
 *   2. Clears existing catalog, then creates categories + items
 *   3. Downloads & uploads images for every item
 *
 * Usage:  npx tsx src/scripts/seed.ts
 */
import '../config/env.js';
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { randomUUID } from 'node:crypto';

const SQUARE_VERSION = '2024-12-18';

const api = axios.create({
  baseURL: env.SQUARE_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_VERSION,
  },
  timeout: 30_000,
});

// ═══════════════════════════════════════════════════════════════════════════
// Data definitions
// ═══════════════════════════════════════════════════════════════════════════

interface SeedVariation { name: string; priceCents: number }
interface SeedItem { name: string; description: string; variations: SeedVariation[]; imageUrl: string }
interface SeedCategory { categoryName: string; items: SeedItem[] }

const LOCATION = {
  name: 'PerDiem Downtown',
  address: {
    address_line_1: '123 Main Street',
    locality: 'San Francisco',
    administrative_district_level_1: 'CA',
    postal_code: '94105',
    country: 'US',
  },
  description: 'Flagship restaurant in the heart of downtown SF',
  timezone: 'America/Los_Angeles',
  business_hours: {
    periods: [
      { day_of_week: 'MON', start_local_time: '08:00:00', end_local_time: '22:00:00' },
      { day_of_week: 'TUE', start_local_time: '08:00:00', end_local_time: '22:00:00' },
      { day_of_week: 'WED', start_local_time: '08:00:00', end_local_time: '22:00:00' },
      { day_of_week: 'THU', start_local_time: '08:00:00', end_local_time: '22:00:00' },
      { day_of_week: 'FRI', start_local_time: '08:00:00', end_local_time: '23:00:00' },
      { day_of_week: 'SAT', start_local_time: '09:00:00', end_local_time: '23:00:00' },
      { day_of_week: 'SUN', start_local_time: '09:00:00', end_local_time: '21:00:00' },
    ],
  },
};

const MENU: SeedCategory[] = [
  {
    categoryName: 'Appetizers',
    items: [
      {
        name: 'Crispy Spring Rolls',
        description: 'Golden-fried vegetable spring rolls served with sweet chili dipping sauce.',
        variations: [{ name: 'Regular', priceCents: 850 }],
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=450&fit=crop',
      },
      {
        name: 'Bruschetta',
        description: 'Toasted ciabatta topped with diced tomatoes, fresh basil, garlic, and balsamic glaze.',
        variations: [{ name: 'Regular', priceCents: 950 }],
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=450&fit=crop',
      },
      {
        name: 'Soup of the Day',
        description: "Chef's daily creation served with artisan bread.",
        variations: [{ name: 'Cup', priceCents: 600 }, { name: 'Bowl', priceCents: 900 }],
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=450&fit=crop',
      },
      {
        name: 'Garlic Bread',
        description: 'Toasted sourdough bread with roasted garlic butter and herbs.',
        variations: [{ name: 'Regular', priceCents: 550 }, { name: 'With Cheese', priceCents: 750 }],
        imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=450&fit=crop',
      },
      {
        name: 'Loaded Nachos',
        description: 'Tortilla chips piled high with cheddar, jalapenos, sour cream, and guacamole.',
        variations: [{ name: 'Half', priceCents: 850 }, { name: 'Full', priceCents: 1250 }],
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=450&fit=crop',
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, vine-ripened tomatoes, basil, and aged balsamic reduction.',
        variations: [{ name: 'Regular', priceCents: 1050 }],
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&h=450&fit=crop',
      },
    ],
  },
  {
    categoryName: 'Mains',
    items: [
      {
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with aged cheddar, lettuce, tomato, pickles, and signature sauce on a brioche bun.',
        variations: [{ name: 'Single', priceCents: 1450 }, { name: 'Double', priceCents: 1850 }],
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop',
      },
      {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon fillet with lemon-dill butter, roasted vegetables, and wild rice pilaf.',
        variations: [{ name: 'Regular', priceCents: 2200 }],
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=450&fit=crop',
      },
      {
        name: 'Margherita Pizza',
        description: 'Wood-fired pizza with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil.',
        variations: [{ name: 'Personal (10")', priceCents: 1200 }, { name: 'Large (14")', priceCents: 1800 }],
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop',
      },
      {
        name: 'Chicken Caesar Salad',
        description: 'Grilled chicken breast over crisp romaine with house-made Caesar dressing, parmesan, and garlic croutons.',
        variations: [{ name: 'Regular', priceCents: 1350 }],
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=450&fit=crop',
      },
      {
        name: 'Pasta Carbonara',
        description: 'Spaghetti with pancetta, egg yolk, pecorino romano, and cracked black pepper.',
        variations: [{ name: 'Regular', priceCents: 1600 }],
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=450&fit=crop',
      },
      {
        name: 'BBQ Pulled Pork Sandwich',
        description: 'Slow-smoked pulled pork with tangy BBQ sauce, coleslaw, and pickles on a toasted bun.',
        variations: [{ name: 'Regular', priceCents: 1500 }],
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=450&fit=crop',
      },
      {
        name: 'Teriyaki Chicken Bowl',
        description: 'Grilled teriyaki chicken over steamed jasmine rice with stir-fried vegetables and sesame seeds.',
        variations: [{ name: 'Regular', priceCents: 1400 }],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop',
      },
      {
        name: 'Fish and Chips',
        description: 'Beer-battered Atlantic cod with thick-cut fries, mushy peas, and tartar sauce.',
        variations: [{ name: 'Regular', priceCents: 1650 }],
        imageUrl: 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=600&h=450&fit=crop',
      },
      {
        name: 'Veggie Stir Fry',
        description: 'Seasonal vegetables wok-tossed in ginger-soy glaze, served with steamed brown rice.',
        variations: [{ name: 'Regular', priceCents: 1250 }],
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=450&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=450&fit=crop',
      },
      {
        name: 'Fettuccine Alfredo',
        description: 'Fettuccine in a rich and creamy parmesan alfredo sauce.',
        variations: [{ name: 'Regular', priceCents: 1400 }, { name: 'With Chicken', priceCents: 1750 }],
        imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=450&fit=crop',
      },
      {
        name: 'Pad Thai',
        description: 'Rice noodles with shrimp, tofu, bean sprouts, peanuts, and tamarind sauce.',
        variations: [{ name: 'Regular', priceCents: 1550 }],
        imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=450&fit=crop',
      },
      {
        name: 'Lasagna Bolognese',
        description: 'Layers of pasta, slow-cooked beef ragu, bechamel, and melted mozzarella.',
        variations: [{ name: 'Regular', priceCents: 1600 }],
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=450&fit=crop',
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
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop',
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla bean ice cream.',
        variations: [{ name: 'Regular', priceCents: 1100 }],
        imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=450&fit=crop',
      },
      {
        name: 'New York Cheesecake',
        description: 'Rich and creamy cheesecake with a graham cracker crust, topped with berry compote.',
        variations: [{ name: 'Regular', priceCents: 1050 }],
        imageUrl: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&h=450&fit=crop',
      },
      {
        name: 'Creme Brulee',
        description: 'Classic vanilla custard with a caramelized sugar crust.',
        variations: [{ name: 'Regular', priceCents: 950 }],
        imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&h=450&fit=crop',
      },
      {
        name: 'Gelato Selection',
        description: "Three scoops of house-made Italian gelato. Ask for today's flavors.",
        variations: [{ name: '1 Scoop', priceCents: 450 }, { name: '3 Scoops', priceCents: 1000 }],
        imageUrl: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&h=450&fit=crop',
      },
    ],
  },
  {
    categoryName: 'Drinks',
    items: [
      {
        name: 'Fresh Lemonade',
        description: 'House-squeezed lemonade with a hint of mint.',
        variations: [{ name: 'Regular', priceCents: 450 }, { name: 'Large', priceCents: 600 }],
        imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&h=450&fit=crop',
      },
      {
        name: 'Espresso',
        description: 'Double shot of premium Italian espresso.',
        variations: [{ name: 'Regular', priceCents: 350 }],
        imageUrl: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=450&fit=crop',
      },
      {
        name: 'Iced Tea',
        description: 'Cold-brewed black tea served over ice with a lemon wedge.',
        variations: [{ name: 'Regular', priceCents: 400 }],
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=450&fit=crop',
      },
      {
        name: 'Mango Smoothie',
        description: 'Blended fresh mango, yogurt, and honey over ice.',
        variations: [{ name: 'Regular', priceCents: 650 }],
        imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=450&fit=crop',
      },
      {
        name: 'Hot Chocolate',
        description: 'Rich Belgian chocolate melted into steamed milk, topped with whipped cream.',
        variations: [{ name: 'Regular', priceCents: 500 }, { name: 'Large', priceCents: 650 }],
        imageUrl: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=600&h=450&fit=crop',
      },
    ],
  },
  {
    categoryName: 'Sides',
    items: [
      {
        name: 'French Fries',
        description: 'Crispy golden fries seasoned with sea salt. Add truffle oil for an upgrade.',
        variations: [{ name: 'Regular', priceCents: 450 }, { name: 'Truffle', priceCents: 700 }],
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=450&fit=crop',
      },
      {
        name: 'Sweet Potato Fries',
        description: 'Lightly salted and served with chipotle aioli.',
        variations: [{ name: 'Regular', priceCents: 550 }],
        imageUrl: 'https://images.unsplash.com/photo-1529589510304-b7e994a92f60?w=600&h=450&fit=crop',
      },
      {
        name: 'Garden Salad',
        description: 'Mixed greens, cherry tomatoes, cucumber, red onion, and balsamic vinaigrette.',
        variations: [{ name: 'Regular', priceCents: 500 }],
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop',
      },
      {
        name: 'Onion Rings',
        description: 'Beer-battered onion rings with smoky ranch dipping sauce.',
        variations: [{ name: 'Regular', priceCents: 600 }],
        imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=450&fit=crop',
      },
      {
        name: 'Coleslaw',
        description: 'Creamy house-made coleslaw with apple cider vinegar dressing.',
        variations: [{ name: 'Regular', priceCents: 350 }],
        imageUrl: 'https://images.unsplash.com/photo-1625938145744-e380515399bf?w=600&h=450&fit=crop',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Step 1 — Create Location
// ═══════════════════════════════════════════════════════════════════════════

async function createLocation(): Promise<string> {
  console.log('─── Step 1: Creating location ───\n');

  const { data } = await api.post('/locations', {
    location: {
      name: LOCATION.name,
      address: LOCATION.address,
      description: LOCATION.description,
      timezone: LOCATION.timezone,
      business_hours: LOCATION.business_hours,
      status: 'ACTIVE',
    },
  });

  const loc = data.location;
  console.log(`  Created: ${loc.name}`);
  console.log(`  ID:      ${loc.id}`);
  console.log(`  Address: ${loc.address?.address_line_1}, ${loc.address?.locality}`);
  console.log();

  return loc.id as string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 2 — Create Categories + Items
// ═══════════════════════════════════════════════════════════════════════════

interface CreatedItem {
  id: string;
  name: string;
}

async function clearExistingCatalog(): Promise<void> {
  console.log('  Clearing existing catalog...');
  let cursor: string | undefined;
  const ids: string[] = [];

  do {
    const body: Record<string, unknown> = { object_types: ['ITEM', 'CATEGORY'], limit: 100 };
    if (cursor) body.cursor = cursor;
    const { data } = await api.post('/catalog/search', body);
    if (data.objects) ids.push(...data.objects.map((o: { id: string }) => o.id));
    cursor = data.cursor;
  } while (cursor);

  if (ids.length > 0) {
    await api.post('/catalog/batch-delete', { object_ids: ids });
    console.log(`  Deleted ${ids.length} existing objects.`);
  } else {
    console.log('  No existing objects to delete.');
  }
}

async function createCatalog(locationId: string): Promise<CreatedItem[]> {
  console.log('─── Step 2: Creating categories & items ───\n');

  await clearExistingCatalog();

  const objects: Record<string, unknown>[] = [];
  const categoryIds = new Map<string, string>();

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

  const itemTempIds = new Map<string, string>(); // tempId → item name

  for (const group of MENU) {
    const catId = categoryIds.get(group.categoryName)!;
    for (const item of group.items) {
      const itemId = `#item-${randomUUID().slice(0, 8)}`;
      itemTempIds.set(itemId, item.name);

      objects.push({
        type: 'ITEM',
        id: itemId,
        present_at_all_locations: true,
        item_data: {
          name: item.name,
          description: item.description,
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
              price_money: { amount: v.priceCents, currency: 'USD' },
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

  const mapped: { id: string; type: string; item_data?: { name: string } }[] = data.objects ?? [];
  const createdItems: CreatedItem[] = mapped
    .filter((o) => o.type === 'ITEM')
    .map((o) => ({ id: o.id, name: o.item_data?.name ?? '' }));

  const catCount = mapped.filter((o) => o.type === 'CATEGORY').length;

  console.log(`  Created ${mapped.length} objects (${catCount} categories, ${createdItems.length} items)\n`);

  for (const group of MENU) {
    console.log(`    ${group.categoryName}: ${group.items.length} items`);
  }
  console.log();

  return createdItems;
}

// ═══════════════════════════════════════════════════════════════════════════
// Step 3 — Upload Images
// ═══════════════════════════════════════════════════════════════════════════

function getImageUrl(itemName: string): string | undefined {
  for (const group of MENU) {
    const item = group.items.find((i) => i.name === itemName);
    if (item) return item.imageUrl;
  }
  return undefined;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15_000 });
  return Buffer.from(response.data);
}

async function uploadImage(itemId: string, itemName: string, imageBuffer: Buffer): Promise<void> {
  const form = new FormData();

  const requestJson = JSON.stringify({
    idempotency_key: randomUUID(),
    object_id: itemId,
    image: {
      type: 'IMAGE',
      id: `#img-${randomUUID().slice(0, 8)}`,
      image_data: { name: itemName, caption: itemName },
    },
  });

  form.append('request', requestJson, { contentType: 'application/json' });
  form.append('image_file', imageBuffer, {
    filename: `${itemName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    contentType: 'image/jpeg',
  });

  await axios.post(`${env.SQUARE_BASE_URL}/catalog/images`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': SQUARE_VERSION,
    },
    timeout: 30_000,
  });
}

async function uploadAllImages(items: CreatedItem[]): Promise<void> {
  console.log('─── Step 3: Uploading images ───\n');

  let uploaded = 0;
  let failed = 0;

  for (const item of items) {
    const imageUrl = getImageUrl(item.name);
    if (!imageUrl) {
      console.log(`  [skip] ${item.name} — no image URL mapped`);
      continue;
    }

    try {
      process.stdout.write(`  [${uploaded + failed + 1}/${items.length}] ${item.name}...`);
      const buffer = await downloadImage(imageUrl);
      await uploadImage(item.id, item.name, buffer);
      console.log(` OK (${(buffer.length / 1024).toFixed(0)} KB)`);
      uploaded++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(` FAILED: ${msg}`);
      failed++;
    }
  }

  console.log(`\n  Images uploaded: ${uploaded}, failed: ${failed}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   PerDiem Menu — Master Seed Script      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const locationId = await createLocation();
  const items = await createCatalog(locationId);
  await uploadAllImages(items);

  console.log('═══════════════════════════════════════════');
  console.log('  All done! Summary:');
  console.log(`  • Location:   ${LOCATION.name} (${locationId})`);
  console.log(`  • Categories: ${MENU.length}`);
  console.log(`  • Items:      ${items.length} (with images)`);
  console.log('═══════════════════════════════════════════');
  console.log('\n  Restart your dev server to clear the cache.\n');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.response?.data ?? err.message);
  process.exit(1);
});
