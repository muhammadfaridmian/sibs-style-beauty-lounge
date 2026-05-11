export const defaultBusinessProfile = {
  // This is the public salon card the site reads for contact and branding.
  name: "Sibs Style Beauty Lounge",
  tagline: "Bespoke beauty services tailored for you",
  description:
    "An editorial skincare destination where each visit is curated through texture, scent, and scientific precision.",
  email: "mcjalandoni@yahoo.com",
  phone: "052 906 3016",
  addressLine1: "Al Hashar Building - Salah Al Din St - Office no 301 - Main Road",
  addressLine2: "next to Crown Plaza Hotel - Muteena - Deira",
  city: "Dubai",
  state: "",
  postalCode: "UAE",
  timezone: "Asia/Dubai",
  logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
  googleMapsUrl: "https://share.google/lWLJiTBONnJlR29z7",
  socialInstagram: "https://www.instagram.com/sibsstylebeauty?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  socialFacebook: "https://www.facebook.com/profile.php?id=61584300861932",
  openingHours: {
    mondayFriday: "Monday OFF | Tuesday-Thursday 10:00 AM - 9:00 PM | Friday-Sunday 10:00 AM - 10:00 PM",
    saturday: "Saturday 10:00 AM - 10:00 PM",
    sunday: "Sunday 10:00 AM - 10:00 PM",
  },
  // The booking page uses this same address when it creates a new appointment.
  weeklyHours: {
    monday: "OFF",
    tuesday: "10:00 AM - 9:00 PM",
    wednesday: "10:00 AM - 9:00 PM",
    thursday: "10:00 AM - 9:00 PM",
    friday: "10:00 AM - 10:00 PM",
    saturday: "10:00 AM - 10:00 PM",
    sunday: "10:00 AM - 10:00 PM",
  },
  standardSlots: [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
  ],
  bookingLeadMinutes: 0,
  bookingIntervalMinutes: 60,
// These are the service cards shown to customers before they book.
};

export const defaultAppointmentLocation =
  "Al Hashar Building - Salah Al Din St - Office no 301 - Main Road - next to Crown Plaza Hotel - Muteena - Deira, Dubai, UAE";

export const defaultServices = [
  {
    slug: "signature-radiance",
    name: "The Signature Radiance",
    shortDescription:
      "A 75-minute deep hydration treatment using 24k gold-infused serums and botanical extracts.",
    fullDescription:
      "A restorative radiance ritual designed to flood the skin with moisture, luminosity, and a visibly smoother finish. This 75-minute treatment layers 24k gold-infused serums, botanical concentrates, and gentle massage techniques to leave the complexion supple, dewy, and refined.",
    priceCents: 14500,
    durationMinutes: 75,
    category: "Facial Ritual",
    imageUrl: "https://images.unsplash.com/photo-1570172619380-2126ad04840b?q=80&w=1470&auto=format&fit=crop",
    featured: true,
    active: true,
    sortOrder: 1,
    keyBenefits: ["Deep hydration", "Glow restoration", "Botanical infusion"],
  },
  {
    slug: "ethereal-sculpting",
    name: "Ethereal Sculpting",
    shortDescription:
      "Manual lymphatic drainage combined with cryotherapy for an instant lifting effect.",
    fullDescription:
      "A contour-shaping treatment focused on de-puffing, lifting, and refining the appearance of facial structure. Manual lymphatic drainage is paired with cooling cryotherapy to energize the skin, encourage circulation, and create a fresher, more sculpted look.",
    priceCents: 18000,
    durationMinutes: 90,
    category: "Sculpting",
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1470&auto=format&fit=crop",
    featured: true,
    active: true,
    sortOrder: 2,
    keyBenefits: ["De-puffing", "Lymphatic drainage", "Lifted finish"],
  },
  {
    slug: "botanical-clarifier",
    name: "Botanical Clarifier",
    shortDescription:
      "Focused detoxing facial using rare clay minerals and steam-distilled floral waters.",
    fullDescription:
      "A cleansing, balancing facial that targets congestion without stripping the skin. Rare clay minerals, steam-distilled floral waters, and a refined extraction process help clarify pores while maintaining a soft and comfortable finish.",
    priceCents: 12000,
    durationMinutes: 60,
    category: "Clarifying",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1470&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 3,
    keyBenefits: ["Pore refinement", "Detox support", "Balanced glow"],
  },
  {
    slug: "silk-protein-infusion",
    name: "Silk Protein Infusion",
    shortDescription:
      "Repair and strengthen skin barrier with pure silk proteins and amino acids.",
    fullDescription:
      "A barrier-supporting service built for skin that feels stressed, dry, or depleted. Pure silk proteins, amino acids, and conditioning layers work together to restore softness and resilience while improving the skin's overall comfort.",
    priceCents: 16000,
    durationMinutes: 80,
    category: "Barrier Repair",
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1470&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 4,
    keyBenefits: ["Barrier support", "Amino acid care", "Silky finish"],
  },
  {
    slug: "antioxidant-berry-blast",
    name: "Antioxidant Berry Blast",
    shortDescription:
      "Potent vitamin infusion to combat environmental stressors and brighten tone.",
    fullDescription:
      "A vitamin-rich infusion intended to defend the complexion against dullness and daily environmental stress. Berry extracts, brightening actives, and a revitalizing finish help the skin look fresher and more even-toned.",
    priceCents: 13500,
    durationMinutes: 70,
    category: "Brightening",
    imageUrl: "https://images.unsplash.com/photo-1515847049296-a281d6401047?q=80&w=1470&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 5,
    keyBenefits: ["Vitamin boost", "Tone brightness", "Environmental defense"],
  },
  {
    slug: "deep-tissue-resurfacing",
    name: "Deep Tissue Resurfacing",
    shortDescription:
      "Advanced exfoliation and cell renewal for uneven texture and fine lines.",
    fullDescription:
      "A more intensive resurfacing ritual for texture, congestion, and visible fatigue. Advanced exfoliation and renewal methods help smooth the skin's surface while supporting a brighter, more polished appearance.",
    priceCents: 21000,
    durationMinutes: 105,
    category: "Resurfacing",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1470&auto=format&fit=crop",
    featured: true,
    active: true,
    sortOrder: 6,
    keyBenefits: ["Texture refinement", "Cell renewal", "Even finish"],
  },
];

// These are the staff cards shown on the artisans page and in admin tools.
export const defaultStylists = [
  {
    name: "Elena Vance",
    role: "Master Aesthetician",
    bio:
      "With over 15 years in luxury skincare, Elena specializes in dermal sculpting and bespoke botanical infusions. Her philosophy centers on cellular regeneration and long-term vitality.",
    imageUrl: "https://images.unsplash.com/photo-1594744803329-a584af1cae02?q=80&w=800&auto=format&fit=crop",
    specialties: ["Dermal sculpting", "Botanical infusion", "Skin renewal"],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    name: "Julian Thorne",
    role: "Skin Health Consultant",
    bio:
      "Julian approaches beauty through the lens of chemistry and wellness. His curative sessions focus on inflammatory balance and protective barriers for sensitive complexions.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    specialties: ["Barrier care", "Consultation", "Inflammation balance"],
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    name: "Sienna Rose",
    role: "Ritual Architect",
    bio:
      "The creator of our signature Luminous Flow, Sienna bridges the gap between holistic meditation and advanced facials to create a transcendental beauty experience.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
    specialties: ["Holistic rituals", "Facial design", "Luxury experience"],
    featured: true,
    active: true,
    sortOrder: 3,
  },
];

// These promotions power the offers page and the seasonal specials section.
export const defaultPromotions = [
  {
    title: "Glow Membership",
    description:
      "Join our monthly membership for continuous care, bespoke treatments, and exclusive member-only perks designed for year-round radiance.",
    code: "GLOW20",
    imageUrl: "https://i.pinimg.com/originals/6e/48/e1/6e48e1bfeebc6ddd41b2e45286fa60fc.jpg",
    tag: "Most Popular",
    discountText: "20% off select services",
    featured: true,
    active: true,
    sortOrder: 1,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
  },
  {
    title: "Seasonal Rituals",
    description:
      "Experience transformative treatments carefully customized for the current season's unique environmental challenges and skin needs.",
    code: "SEASONAL",
    imageUrl: "https://i.pinimg.com/736x/3f/83/d4/3f83d4777ddd2ebd201ce376c53af924.jpg",
    tag: "Limited Time",
    discountText: "Seasonal curation savings",
    featured: true,
    active: true,
    sortOrder: 2,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
  },
  {
    title: "Bundle & Save",
    description:
      "Combine multiple signature services and take home our premium retail products for exceptional exclusive savings.",
    code: "BUNDLE15",
    imageUrl: "https://i.pinimg.com/1200x/66/7f/71/667f717825dc54f377aa4612c9439609.jpg",
    tag: "Best Value",
    discountText: "Bundle package savings",
    featured: true,
    active: true,
    sortOrder: 3,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
  },
];

// These gallery items are the visual catalogue for the lounge.
export const defaultGalleryItems = [
  {
    title: "Radiance Elixir",
    category: "Product Edit",
    caption: "A luminous bottled ritual.",
    altText: "Luxury serum bottle",
    imageUrl: "https://i.pinimg.com/1200x/a3/43/df/a343dfb6e615e0e65a48411ab0ab833a.jpg",
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    title: "Satin Touch",
    category: "Texture Study",
    caption: "Cream textures in motion.",
    altText: "Cream texture study",
    imageUrl: "https://i.pinimg.com/1200x/66/23/9a/66239a1485de08d7c9d73f52e4ca2408.jpg",
    featured: true,
    active: true,
    sortOrder: 2,
  },
  {
    title: "The Sanctuary",
    category: "Space",
    caption: "A calm interior with editorial light.",
    altText: "Spa interior",
    imageUrl: "https://i.pinimg.com/736x/b8/ec/cb/b8eccbefb90d0b642f1152624fa09459.jpg",
    featured: true,
    active: true,
    sortOrder: 3,
  },
  {
    title: "Golden Hour",
    category: "Oil Infusion",
    caption: "Amber glass and tonal warmth.",
    altText: "Face oil bottle",
    imageUrl: "https://i.pinimg.com/1200x/a3/20/48/a320481f501bec266ffc9c8c494cff69.jpg",
    featured: false,
    active: true,
    sortOrder: 4,
  },
  {
    title: "Velvet Lounge",
    category: "Interior",
    caption: "Dark velvet and layered shadows.",
    altText: "Spa lounge interior",
    imageUrl: "https://i.pinimg.com/736x/26/8d/22/268d22a96e65f8e21b6ea4836e1a3644.jpg",
    featured: false,
    active: true,
    sortOrder: 5,
  },
  {
    title: "The Ritual",
    category: "Self Care",
    caption: "A moment of hands-on restoration.",
    altText: "Woman applying cream",
    imageUrl: "https://i.pinimg.com/1200x/67/fb/63/67fb63d99a2ea5fce9cb0a074d6b73ba.jpg",
    featured: true,
    active: true,
    sortOrder: 6,
  },
  {
    title: "Curated Essentials",
    category: "Collection",
    caption: "A library of bottles and tools.",
    altText: "Collection of bottles",
    imageUrl: "https://i.pinimg.com/736x/5c/16/eb/5c16eb439f95a147912e87c8f4a297d1.jpg",
    featured: false,
    active: true,
    sortOrder: 7,
  },
  {
    title: "Inner Glow",
    category: "Abstract",
    caption: "A luminous abstract moment.",
    altText: "Abstract light glow",
    imageUrl: "https://i.pinimg.com/736x/74/3e/7e/743e7e91713fd66db2f223afe5c2255e.jpg",
    featured: false,
    active: true,
    sortOrder: 8,
  },
  {
    title: "Botanical Essence",
    category: "Micro Edit",
    caption: "A precise dropper composition.",
    altText: "Botanical essence dropper",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612ca8d8?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 9,
  },
  {
    title: "The Shelfie",
    category: "Minimalism",
    caption: "Minimal bath styling and calm surfaces.",
    altText: "Minimalist skincare shelf",
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 10,
  },
  {
    title: "Raw Texture",
    category: "Skin Study",
    caption: "Close-up skin detail and tone.",
    altText: "Raw skin texture",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 11,
  },
  {
    title: "Crafted Precision",
    category: "Tools",
    caption: "Luxury instruments in focus.",
    altText: "Luxury spa tools",
    imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    sortOrder: 12,
  },
];

// These reviews are starter testimonials so the homepage does not look empty.
export const defaultReviews = [
  {
    name: "Gerardine Alcala",
    role: "Verified Guest",
    email: "gerardine@example.com",
    avatarUrl: "",
    rating: 5,
    mainQuote:
      "It was my first time visiting, and I had a wonderful experience. The salon is clean, and the staff are warm, welcoming, and very accommodating. It truly feels like a hidden gem in the area.",
    subQuote1:
      "I availed their points package, which is a great deal considering the quality of care and service they provide. I had a haircut, brow threading, waxing, and a mani-pedi. Ate Marilyn did such a lovely job with my haircut, and Ms. Hanan cleaned up my brows so well.",
    subQuote2:
      "The waxing was done smoothly with minimal discomfort, and Ate Mavi and Lean made sure I was comfortable throughout the process. I’ll definitely be coming back and would highly recommend this place!",
    serviceName: "Pedicure, Waxing, Manicure",
    featured: true,
    isApproved: true,
    sortOrder: 1,
  },
  {
    name: "Mikaelah Paloma",
    role: "Verified Guest",
    email: "mikaelah@example.com",
    avatarUrl: "",
    rating: 5,
    mainQuote:
      "First time getting my hair done in Dubai and I didn’t regret trying Sibs Style Beauty Lounge at all.",
    subQuote1:
      "The staff were very accommodating, and the place is spacious, clean, and overall very pleasant. Special thanks to my hairdresser and lash tech 🥰",
    subQuote2:
      "I’ll definitely come back 🤍 Highly recommended for anyone looking for quality service in a beautiful environment!",
    serviceName: "Hairstyling, Eyelash extensions",
    featured: true,
    isApproved: true,
    sortOrder: 2,
  },
  {
    name: "Guendez Narimane",
    role: "Verified Guest",
    email: "guendez@example.com",
    avatarUrl: "",
    rating: 5,
    mainQuote:
      "Atmosphere service and prices are excellent, it's a pleasure experiencing this especially in this area.",
    subQuote1:
      "I did waxing with miss fulla the owner of the saloon. It's honestly a very very good experience i will definitely come back again!",
    subQuote2:
      "The professionalism and welcoming nature of the entire team made it a standout visit. Five stars!",
    serviceName: "Waxing, Manicure",
    featured: true,
    isApproved: true,
    sortOrder: 3,
  },
];

export const defaultAdminCredentials = {
  // The real values should come from env vars on your machine, not from GitHub.
  fullName: process.env.DEFAULT_ADMIN_FULLNAME || "Sibs Style Admin",
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
  phone: process.env.DEFAULT_ADMIN_PHONE || "000-000-0000",
  // NOTE: For security, set a strong password in your local env (DEFAULT_ADMIN_PASSWORD).
  // The fallback below is intentionally weak so the seeded account is not privileged in public repos.
  password: process.env.DEFAULT_ADMIN_PASSWORD || "changeme",
};
