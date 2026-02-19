/**
 * Uploads food images to existing Square Sandbox catalog items.
 *
 * Usage:  npx tsx src/scripts/seed-images.ts
 */
import '../config/env.js';
import axios from 'axios';
import FormData from 'form-data';
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

// Map item names to food image URLs (Unsplash, free to use)
const IMAGE_URLS: Record<string, string> = {
  // Appetizers
  'Crispy Spring Rolls':
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=450&fit=crop',
  'Bruschetta':
    'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=450&fit=crop',
  'Soup of the Day':
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=450&fit=crop',
  'Garlic Bread':
    'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=450&fit=crop',
  'Loaded Nachos':
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=450&fit=crop',
  'Caprese Salad':
    'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&h=450&fit=crop',

  // Mains
  'Classic Cheeseburger':
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop',
  'Grilled Salmon':
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=450&fit=crop',
  'Margherita Pizza':
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop',
  'Chicken Caesar Salad':
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=450&fit=crop',
  'Pasta Carbonara':
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=450&fit=crop',
  'BBQ Pulled Pork Sandwich':
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=450&fit=crop',
  'Teriyaki Chicken Bowl':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop',
  'Fish and Chips':
    'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=600&h=450&fit=crop',
  'Veggie Stir Fry':
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=450&fit=crop',

  // Pasta & Noodles
  'Penne Arrabbiata':
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=450&fit=crop',
  'Fettuccine Alfredo':
    'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=450&fit=crop',
  'Pad Thai':
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=450&fit=crop',
  'Lasagna Bolognese':
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=450&fit=crop',

  // Desserts
  'Tiramisu':
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop',
  'Chocolate Lava Cake':
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=450&fit=crop',
  'New York Cheesecake':
    'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&h=450&fit=crop',
  'Crème Brûlée':
    'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&h=450&fit=crop',
  'Gelato Selection':
    'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&h=450&fit=crop',

  // Drinks
  'Fresh Lemonade':
    'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&h=450&fit=crop',
  'Espresso':
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=450&fit=crop',
  'Iced Tea':
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=450&fit=crop',
  'Mango Smoothie':
    'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=450&fit=crop',
  'Hot Chocolate':
    'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=600&h=450&fit=crop',

  // Sides
  'French Fries':
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=450&fit=crop',
  'Sweet Potato Fries':
    'https://images.unsplash.com/photo-1529589510304-b7e994a92f60?w=600&h=450&fit=crop',
  'Garden Salad':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop',
  'Onion Rings':
    'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=450&fit=crop',
  'Coleslaw':
    'https://images.unsplash.com/photo-1625938145744-e380515399bf?w=600&h=450&fit=crop',
};

async function fetchCatalogItems(): Promise<
  { id: string; name: string; hasImage: boolean }[]
> {
  const { data } = await api.post('/catalog/search', {
    object_types: ['ITEM'],
    include_related_objects: false,
  });

  return (data.objects ?? []).map(
    (obj: { id: string; item_data?: { name: string; image_ids?: string[] } }) => ({
      id: obj.id,
      name: obj.item_data?.name ?? '',
      hasImage: (obj.item_data?.image_ids?.length ?? 0) > 0,
    }),
  );
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15_000 });
  return Buffer.from(response.data);
}

async function uploadImage(itemId: string, itemName: string, imageBuffer: Buffer) {
  const form = new FormData();

  const requestJson = JSON.stringify({
    idempotency_key: randomUUID(),
    object_id: itemId,
    image: {
      type: 'IMAGE',
      id: `#img-${randomUUID().slice(0, 8)}`,
      image_data: {
        name: itemName,
        caption: itemName,
      },
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
      'Square-Version': '2024-12-18',
    },
    timeout: 30_000,
  });
}

async function seed() {
  console.log('Uploading images to Square Sandbox catalog...\n');

  const items = await fetchCatalogItems();
  console.log(`  Found ${items.length} catalog items.\n`);

  let uploaded = 0;
  let skipped = 0;

  for (const item of items) {
    if (item.hasImage) {
      console.log(`  [skip] ${item.name} — already has an image`);
      skipped++;
      continue;
    }

    const imageUrl = IMAGE_URLS[item.name];
    if (!imageUrl) {
      console.log(`  [skip] ${item.name} — no image URL mapped`);
      skipped++;
      continue;
    }

    try {
      console.log(`  [download] ${item.name}...`);
      const buffer = await downloadImage(imageUrl);

      console.log(`  [upload]   ${item.name} (${(buffer.length / 1024).toFixed(0)} KB)`);
      await uploadImage(item.id, item.name, buffer);
      uploaded++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${item.name}: ${msg}`);
    }
  }

  console.log(`\nDone! Uploaded ${uploaded} images, skipped ${skipped}.`);
  console.log('Restart the server to clear the cache and see images in the app.');
}

seed().catch((err) => {
  console.error('Failed:', err.response?.data ?? err.message);
  process.exit(1);
});
