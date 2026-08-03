/**
 * Add new promotional offers to the live Sibs Style Convex backend.
 *
 * Usage:
 *   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="yourpassword" bun run scripts/add-offers.ts
 *
 * Or pass credentials inline:
 *   bun run scripts/add-offers.ts you@example.com yourpassword
 *
 * The script logs in as admin, then creates each offer that does not already
 * exist (matched by promo code) so it is safe to run multiple times.
 */

const API_BASE = 'https://proficient-akita-599.convex.site';

// These are the new offers to add. Each one has a short validity window
// (a few days from "today") so the countdown timers on the offers page
// actually feel urgent and real to customers.
const today = new Date();
const inDays = (n: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

interface NewOffer {
  title: string;
  description: string;
  code: string;
  imageUrl: string;
  tag: string;
  discountText: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  offerType: 'LIMITED_EXCLUSIVE' | 'CURRENT_SPECIAL';
}

const newOffers: NewOffer[] = [
  {
    title: 'Weekend Wind Down',
    description:
      'Unwind with any 60 minute relaxing massage this weekend and enjoy 15 percent off your session. Limited slots available.',
    code: 'WEEKEND15',
    imageUrl: 'https://i.pinimg.com/1200x/65/e8/1c/65e81c0a1ab979bd8b005b5cb3cebb13.jpg',
    tag: 'Flash Deal',
    discountText: '15% off weekend massage',
    featured: true,
    active: true,
    sortOrder: 4,
    startDate: inDays(0),
    endDate: inDays(5),
    offerType: 'CURRENT_SPECIAL',
  },
  {
    title: 'Glow Midweek Facial',
    description:
      'Recharge your skin this week with our signature facial ritual. Book Monday to Thursday and save 20 percent on every session.',
    code: 'MIDWEEK20',
    imageUrl: 'https://i.pinimg.com/736x/3f/83/d4/3f83d4777ddd2ebd201ce376c53af924.jpg',
    tag: 'This Week Only',
    discountText: '20% off midweek facials',
    featured: true,
    active: true,
    sortOrder: 5,
    startDate: inDays(0),
    endDate: inDays(7),
    offerType: 'CURRENT_SPECIAL',
  },
  {
    title: 'First Touch Welcome',
    description:
      'New to Sibs Style? Enjoy 25 percent off your very first nail care ritual. A warm welcome to the lounge, reserved for first time visitors only.',
    code: 'FIRSTTOUCH25',
    imageUrl: 'https://i.pinimg.com/originals/6e/48/e1/6e48e1bfeebc6ddd41b2e45286fa60fc.jpg',
    tag: 'New Clients',
    discountText: '25% off first nail ritual',
    featured: true,
    active: true,
    sortOrder: 6,
    startDate: inDays(0),
    endDate: inDays(10),
    offerType: 'LIMITED_EXCLUSIVE',
  },
  {
    title: 'Lash Luxury Exclusive',
    description:
      'Elevate your gaze with our premium eyelash extensions. An exclusive 30 percent savings for the next few days only, while appointment slots last.',
    code: 'LASHLUXE30',
    imageUrl: 'https://i.pinimg.com/1200x/66/7f/71/667f717825dc54f377aa4612c9439609.jpg',
    tag: 'Limited Exclusive',
    discountText: '30% off lash extensions',
    featured: true,
    active: true,
    sortOrder: 7,
    startDate: inDays(0),
    endDate: inDays(4),
    offerType: 'LIMITED_EXCLUSIVE',
  },
  {
    title: 'Brow and Lash Duo',
    description:
      'Perfect your frame with a combined eyebrow threading and lash tint ritual. Book both together this week and save 20 percent on the duo.',
    code: 'DUO20',
    imageUrl: 'https://i.pinimg.com/1200x/a3/43/df/a343dfb6e615e0e65a48411ab0ab833a.jpg',
    tag: 'Duo Special',
    discountText: '20% off brow and lash duo',
    featured: true,
    active: true,
    sortOrder: 8,
    startDate: inDays(0),
    endDate: inDays(6),
    offerType: 'CURRENT_SPECIAL',
  },
  {
    title: 'Color Refresh Flash',
    description:
      'Time for a tone lift? Save 15 percent on any hair color or roots touch up ritual. Quick slots, fewer days, bigger glow.',
    code: 'COLORFLASH15',
    imageUrl: 'https://i.pinimg.com/736x/3f/83/d4/3f83d4777ddd2ebd201ce376c53af924.jpg',
    tag: 'Flash Sale',
    discountText: '15% off hair color rituals',
    featured: false,
    active: true,
    sortOrder: 9,
    startDate: inDays(0),
    endDate: inDays(3),
    offerType: 'CURRENT_SPECIAL',
  },
];

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  // The Convex API wraps the payload in { ok, data: { token, user } }.
  const token = json?.data?.token ?? json?.token;
  if (!token) {
    throw new Error(`Login failed: ${json?.error || json?.data?.error || res.statusText}`);
  }
  return token as string;
}

async function listPromotions(): Promise<{ code: string }[]> {
  const res = await fetch(`${API_BASE}/api/promotions`);
  const data = await res.json();
  return (data.data || []) as { code: string }[];
}

async function createPromotion(token: string, offer: NewOffer): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/promotions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(offer),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Failed to create ${offer.code}: ${data.error || res.statusText}`);
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];

  if (!email || !password) {
    console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... bun run scripts/add-offers.ts');
    console.error('   or: bun run scripts/add-offers.ts you@example.com yourpassword');
    process.exit(1);
  }

  console.log(`Logging in as ${email}...`);
  const token = await login(email, password);
  console.log('Logged in. Checking existing promotions...');

  const existing = await listPromotions();
  const existingCodes = new Set(existing.map((p) => p.code.toUpperCase()));
  console.log(`Found ${existingCodes.size} existing promotions: ${[...existingCodes].join(', ')}`);

  let created = 0;
  let skipped = 0;
  for (const offer of newOffers) {
    if (existingCodes.has(offer.code.toUpperCase())) {
      console.log(`  SKIP  ${offer.code} (already exists)`);
      skipped += 1;
      continue;
    }
    try {
      await createPromotion(token, offer);
      console.log(`  CREATE  ${offer.code}  "${offer.title}" [${offer.offerType}] ends ${offer.endDate}`);
      created += 1;
    } catch (e) {
      console.error(`  ERROR  ${offer.code}: ${(e as Error).message}`);
    }
  }

  console.log(`\nDone. Created ${created} new offers, skipped ${skipped} existing.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
