import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { formatMoney, formatTimeLabel, parseTimeLabel } from "./utils";
import { defaultAppointmentLocation, defaultBusinessProfile } from "./seedData";

// These helpers turn raw Convex documents into the friendlier shapes the frontend wants.
type WeeklyHours = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

function getPublicAddress(profile: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  // The dashboard wants one readable address string, not separate fields.
  return [profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.postalCode]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

function getBusinessDayKey(appointmentDate: string, timezone: string): keyof WeeklyHours {
  // This figures out the business weekday in the salon's timezone, not the browser's timezone.
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  }).format(new Date(`${appointmentDate}T12:00:00Z`)).toLowerCase();

  switch (weekday) {
    case "monday":
    case "tuesday":
    case "wednesday":
    case "thursday":
    case "friday":
    case "saturday":
    case "sunday":
      return weekday;
    default:
      throw new Error(`Invalid appointment date: ${appointmentDate}`);
  }
}

function parseOperatingWindow(label: string): { startMinutes: number; endMinutes: number } | null {
  // A label like "10:00 AM - 9:00 PM" gets turned into a real time window here.
  const normalized = label.trim();
  if (!normalized || /^off$/i.test(normalized) || /^closed$/i.test(normalized)) {
    return null;
  }

  const parts = normalized.split("-");
  if (parts.length !== 2) {
    throw new Error(`Invalid operating hours label: ${label}`);
  }

  const startMinutes = parseTimeLabel(parts[0].trim());
  const endMinutes = parseTimeLabel(parts[1].trim());
  if (endMinutes <= startMinutes) {
    throw new Error(`Invalid operating hours label: ${label}`);
  }

  return { startMinutes, endMinutes };
}

function asServiceCard(doc: {
  _id: any;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  priceCents: number;
  priceLabel?: string;
  durationMinutes: number;
  category: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  keyBenefits: string[];
}) {
  // The booking page only needs a friendly card, not the full database row.
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.name,
    name: doc.name,
    shortDescription: doc.shortDescription,
    description: doc.shortDescription,
    fullDescription: doc.fullDescription,
    priceCents: doc.priceCents,
    priceLabel: doc.priceLabel,
    price: formatMoney(doc.priceCents),
    durationMinutes: doc.durationMinutes,
    durationLabel: `${doc.durationMinutes} MINS`,
    category: doc.category,
    imageUrl: doc.imageUrl,
    featured: doc.featured,
    sortOrder: doc.sortOrder,
    keyBenefits: doc.keyBenefits,
  };
}

function asStylistCard(doc: {
  _id: any;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
  featured: boolean;
  sortOrder: number;
}) {
  // Staff cards stay small because the public pages only need the friendly summary.
  return {
    id: doc._id,
    name: doc.name,
    role: doc.role,
    bio: doc.bio,
    imageUrl: doc.imageUrl,
    specialties: doc.specialties,
    featured: doc.featured,
    sortOrder: doc.sortOrder,
  };
}

function asPromotionCard(doc: {
  _id: any;
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
  offerType?: "LIMITED_EXCLUSIVE" | "CURRENT_SPECIAL";
}) {
  // Promotions are reshaped into a compact card for the offers page and homepage blocks.
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    code: doc.code,
    imageUrl: doc.imageUrl,
    tag: doc.tag,
    discountText: doc.discountText,
    featured: doc.featured,
    active: doc.active,
    sortOrder: doc.sortOrder,
    startDate: doc.startDate,
    endDate: doc.endDate,
    offerType: doc.offerType ?? "CURRENT_SPECIAL",
  };
}

function asReviewCard(doc: {
  _id: any;
  name: string;
  role: string;
  rating: number;
  mainQuote: string;
  subQuote1: string;
  subQuote2: string;
  avatarUrl: string;
  serviceName: string | null;
  featured: boolean;
  sortOrder: number;
}) {
  // The testimonial page never sees the raw row, only this public-friendly review shape.
  return {
    id: doc._id,
    name: doc.name,
    role: doc.role,
    rating: doc.rating,
    mainQuote: doc.mainQuote,
    subQuote1: doc.subQuote1,
    subQuote2: doc.subQuote2,
    avatarUrl: doc.avatarUrl,
    serviceName: doc.serviceName,
    featured: doc.featured,
    sortOrder: doc.sortOrder,
  };
}

function asGalleryCard(doc: {
  _id: any;
  title: string;
  category: string;
  caption: string;
  altText: string;
  imageUrl: string | null;
  storageId: any | null;
  featured: boolean;
  sortOrder: number;
}) {
  // Gallery cards keep the uploaded media and the metadata together in one neat package.
  return {
    id: doc._id,
    title: doc.title,
    category: doc.category,
    caption: doc.caption,
    altText: doc.altText,
    imageUrl: doc.imageUrl,
    storageId: doc.storageId,
    featured: doc.featured,
    sortOrder: doc.sortOrder,
  };
}

function asBusinessProfile(doc: {
  _id: any;
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  timezone: string;
  logoUrl: string;
  socialInstagram?: string;
  socialFacebook?: string;
  googleMapsUrl?: string;
  weeklyHours?: WeeklyHours;
  openingHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
  standardSlots: string[];
  bookingLeadMinutes: number;
  bookingIntervalMinutes: number;
}) {
  // The frontend wants one clean business profile object, not a mix of raw database fields.
  return {
    id: doc._id,
    name: doc.name,
    tagline: doc.tagline,
    description: doc.description,
    email: doc.email,
    phone: doc.phone,
    addressLine1: doc.addressLine1,
    addressLine2: doc.addressLine2 ?? null,
    address: getPublicAddress(doc),
    city: doc.city,
    state: doc.state,
    postalCode: doc.postalCode,
    timezone: doc.timezone,
    logoUrl: doc.logoUrl,
    socialInstagram: doc.socialInstagram ?? null,
    socialFacebook: doc.socialFacebook ?? null,
    googleMapsUrl: doc.googleMapsUrl ?? null,
    weeklyHours: doc.weeklyHours ?? defaultBusinessProfile.weeklyHours,
    openingHours: doc.openingHours,
    standardSlots: doc.standardSlots,
    bookingLeadMinutes: doc.bookingLeadMinutes,
    bookingIntervalMinutes: doc.bookingIntervalMinutes,
  };
}

function asAppointmentCard(doc: {
  _id: any;
  userId: any;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceId: any;
  serviceName: string;
  serviceSlug: string;
  servicePriceCents: number;
  serviceDurationMinutes: number;
  appointmentDate: string;
  appointmentTimeLabel: string;
  startMinutes: number;
  endMinutes: number;
  location: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  assignedStylistId: any;
  assignedStylistName: string | null;
  source: string;
  createdAt: number;
  updatedAt: number;
}) {
  // Appointments are reshaped so the admin page can read them without extra work.
  return {
    id: doc._id,
    userId: doc.userId,
    guestName: doc.guestName,
    guestEmail: doc.guestEmail,
    guestPhone: doc.guestPhone,
    serviceId: doc.serviceId,
    serviceName: doc.serviceName,
    serviceSlug: doc.serviceSlug,
    servicePriceCents: doc.servicePriceCents,
    servicePrice: formatMoney(doc.servicePriceCents),
    serviceDurationMinutes: doc.serviceDurationMinutes,
    appointmentDate: doc.appointmentDate,
    appointmentTimeLabel: doc.appointmentTimeLabel,
    appointmentTime: doc.appointmentTimeLabel,
    startMinutes: doc.startMinutes,
    endMinutes: doc.endMinutes,
    startTimeLabel: formatTimeLabel(doc.startMinutes),
    endTimeLabel: formatTimeLabel(doc.endMinutes),
    location: doc.location,
    notes: doc.notes,
    status: doc.status,
    assignedStylistId: doc.assignedStylistId,
    assignedStylistName: doc.assignedStylistName,
    source: doc.source,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  // Two ranges overlap when each one starts before the other ends.
  return startA < endB && endA > startB;
}

export const getBusinessProfile = internalQuery({
  args: {},
  handler: async (ctx) => {
    // The site uses this for the public contact, hours, and branding pieces.
    const profile = await ctx.db.query("businessProfile").take(1);
    if (profile.length === 0) {
      return null;
    }
    return asBusinessProfile(profile[0]);
  },
});

export const listServices = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Booking and homepage cards both read from this same service list.
    const services = await ctx.db
      .query("services")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(50);
    return services.map(asServiceCard);
  },
});

export const getServiceById = internalQuery({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    // Detail views call this when they already know the exact service id.
    const service = await ctx.db.get(args.serviceId);
    return service ? asServiceCard(service) : null;
  },
});

export const getServiceBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Slugs make the service cards shareable in a URL-friendly way.
    const service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return service ? asServiceCard(service) : null;
  },
});

export const listStaff = internalQuery({
  args: {},
  handler: async (ctx) => {
    // These cards back the artisans page and the staff choices in booking.
    const staff = await ctx.db
      .query("stylists")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(20);
    return staff.map(asStylistCard);
  },
});

export const listGallery = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Gallery items can come from storage or from a simple image URL.
    const items = await ctx.db
      .query("galleryItems")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(100);

    const resolved = [] as Array<ReturnType<typeof asGalleryCard> & { imageUrl: string | null }>;
    for (const item of items) {
      const resolvedUrl = item.storageId ? await ctx.storage.getUrl(item.storageId) : item.imageUrl ?? null;
      resolved.push({
        ...asGalleryCard(item),
        imageUrl: resolvedUrl,
      });
    }
    return resolved;
  },
});

export const listApprovedReviews = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Only approved reviews leave the moderation queue and reach the public site.
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_isApproved_and_sortOrder", (q) => q.eq("isApproved", true))
      .order("asc")
      .take(100);
    return reviews.map(asReviewCard);
  },
});

export const listReviewsForAdmin = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // This gives the admin view the full moderation queue in one pass.
    const reviews = await ctx.db.query("reviews").order("desc").take(args.limit ?? 100);
    return reviews.map(asReviewCard);
  },
});

export const listPromotions = internalQuery({
  args: {},
  handler: async (ctx) => {
    // This is the data source for the offers and promotions page.
    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(50);
    return promotions.map(asPromotionCard);
  },
});

export const listCollections = internalQuery({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("collections")
      .withIndex("by_active_and_sortOrder", (q) => q.eq("active", true))
      .order("asc")
      .take(100);

    return items.map((doc) => ({
      id: doc._id,
      title: doc.title,
      description: doc.description ?? null,
      assetKey: doc.assetKey,
      priceCents: doc.priceCents ?? null,
      priceLabel: doc.priceLabel ?? null,
      active: doc.active,
      featured: doc.featured,
      sortOrder: doc.sortOrder,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  },
});

export const createCollection = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assetKey: v.string(),
    priceCents: v.optional(v.number()),
    priceLabel: v.optional(v.string()),
    active: v.boolean(),
    featured: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collections", {
      title: args.title,
      description: args.description ?? null,
      assetKey: args.assetKey,
      priceCents: args.priceCents ?? null,
      priceLabel: args.priceLabel ?? null,
      active: args.active,
      featured: args.featured,
      sortOrder: args.sortOrder,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const listPromotionsForAdmin = internalQuery({
  args: {},
  handler: async (ctx) => {
    const promotions = await ctx.db.query("promotions").order("asc").take(100);
    return promotions.map(asPromotionCard);
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Login and registration both need this exact email lookup.
    // Using the email index keeps the lookup fast even as the users table grows.
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return user ?? null;
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // The auth routes use this to refresh the public user profile after a mutation.
    // The query returns the raw user row so the caller can reshape it as needed.
    return await ctx.db.get(args.userId);
  },
});

export const findSessionByTokenHash = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    // The raw token never leaves the browser; this query only sees the hashed version.
    // That keeps session lookups possible without storing a reusable secret in plain text.
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();
    return session ?? null;
  },
});

export const listAppointmentsForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // This is the signed-in customer's own booking history.
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_userId_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
    return appointments.map(asAppointmentCard);
  },
});

export const listAppointmentsForAdmin = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // The staff dashboard uses this to review the latest bookings quickly.
    // The bounded take keeps the admin screen responsive when bookings accumulate.
    const appointments = await ctx.db.query("appointments").order("desc").take(args.limit ?? 100);
    return appointments.map(asAppointmentCard);
  },
});

export const getAppointmentById = internalQuery({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    // After a booking or admin edit, the UI reads the reshaped card from here.
    const appointment = await ctx.db.get(args.appointmentId);
    return appointment ? asAppointmentCard(appointment) : null;
  },
});

export const getAvailability = internalQuery({
  args: {
    appointmentDate: v.string(),
    serviceId: v.union(v.id("services"), v.null()),
  },
  handler: async (ctx, args) => {
    // Availability is built from salon hours plus any already booked appointments.
    const profileDoc = await ctx.db.query("businessProfile").take(1);
    const profile = profileDoc.length > 0 ? profileDoc[0] : defaultBusinessProfile;
    const standardSlots = profile.standardSlots;
    const weeklyHours = profile.weeklyHours ?? defaultBusinessProfile.weeklyHours;
    const dayKey = getBusinessDayKey(args.appointmentDate, profile.timezone);
    const operatingWindow = parseOperatingWindow(weeklyHours[dayKey]);

    const service = args.serviceId ? await ctx.db.get(args.serviceId) : null;
    const durationMinutes = service?.durationMinutes ?? 60;
    // If the service does not exist yet, the page still gets a safe default duration.

    if (!operatingWindow) {
      return {
        date: args.appointmentDate,
        serviceId: args.serviceId,
        serviceName: service?.name ?? null,
        durationMinutes,
        standardSlots,
        slots: [],
      };
    }

    const bookedAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date_and_startMinutes", (q) => q.eq("appointmentDate", args.appointmentDate))
      .order("asc")
      .take(100);

    // Each standard slot becomes either open or blocked once we compare it to the existing bookings.
    const slots = standardSlots.map((timeLabel) => {
      const startMinutes = parseTimeLabel(timeLabel);
      const endMinutes = startMinutes + durationMinutes;
      const withinHours = startMinutes >= operatingWindow.startMinutes && endMinutes <= operatingWindow.endMinutes;
      const conflicts = withinHours && bookedAppointments.some((appointment) =>
        intervalsOverlap(startMinutes, endMinutes, appointment.startMinutes, appointment.endMinutes),
      );

      return {
        timeLabel,
        startMinutes,
        endMinutes,
        available: withinHours && !conflicts,
        status: conflicts ? "booked" : "open",
      };
    }).filter((slot) => slot.available);

    // Filtering after the map keeps the final list focused on the slots the client can actually book.

    return {
      date: args.appointmentDate,
      serviceId: args.serviceId,
      serviceName: service?.name ?? null,
      durationMinutes,
      standardSlots,
      slots,
    };
  },
});

export const createUser = internalMutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    role: v.union(v.literal("customer"), v.literal("admin")),
    preferredLocation: v.optional(v.string()),
    skinPreferences: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    emailVerified: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Registration lands here after the frontend hashes the password.
    // This duplicate check protects the email index from creating two accounts with the same address.
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      throw new Error("A user with that email already exists.");
    }

    return await ctx.db.insert("users", {
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      role: args.role,
      preferredLocation: args.preferredLocation,
      skinPreferences: args.skinPreferences,
      allergies: args.allergies,
      emailVerified: args.emailVerified,
      isActive: args.isActive,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const touchUserLogin = internalMutation({
  args: { userId: v.id("users"), lastLoginAt: v.number() },
  handler: async (ctx, args) => {
    // Every successful login updates the last-login stamp.
    await ctx.db.patch(args.userId, {
      lastLoginAt: args.lastLoginAt,
      updatedAt: args.lastLoginAt,
    });
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    lastUsedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Sessions are just the server-side copy of a login token.
    return await ctx.db.insert("sessions", {
      userId: args.userId,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      createdAt: args.createdAt,
      lastUsedAt: args.lastUsedAt,
      revoked: false,
    });
  },
});

export const createAppointment = internalMutation({
  args: {
    userId: v.union(v.id("users"), v.null()),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.string(),
    serviceId: v.id("services"),
    appointmentDate: v.string(),
    appointmentTimeLabel: v.string(),
    location: v.string(),
    notes: v.string(),
    assignedStylistId: v.union(v.id("stylists"), v.null()),
    source: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // The booking form calls this, and Convex checks the slot before saving it.
    // The service fetch below also protects against stale service ids from old page state.
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    // The display location comes from the salon defaults so the UI and admin tools match.
    const appointmentLocation = defaultAppointmentLocation;

    const profileDoc = await ctx.db.query("businessProfile").take(1);
    const profile = profileDoc.length > 0 ? profileDoc[0] : defaultBusinessProfile;
    const standardSlots = profile.standardSlots;
    const weeklyHours = profile.weeklyHours ?? defaultBusinessProfile.weeklyHours;
    const dayKey = getBusinessDayKey(args.appointmentDate, profile.timezone);
    const operatingWindow = parseOperatingWindow(weeklyHours[dayKey]);

    if (!operatingWindow) {
      throw new Error("Selected date is outside the booking schedule.");
    }

    if (!standardSlots.includes(args.appointmentTimeLabel)) {
      throw new Error("Selected time is not part of the booking schedule.");
    }

    const startMinutes = parseTimeLabel(args.appointmentTimeLabel);
    const endMinutes = startMinutes + service.durationMinutes;
    if (startMinutes < operatingWindow.startMinutes || endMinutes > operatingWindow.endMinutes) {
      throw new Error("Selected time is outside the booking hours.");
    }

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date_and_startMinutes", (q) => q.eq("appointmentDate", args.appointmentDate))
      .order("asc")
      .take(100);

    const conflict = existingAppointments.find((appointment) =>
      intervalsOverlap(startMinutes, endMinutes, appointment.startMinutes, appointment.endMinutes),
    );
    if (conflict) {
      // If we found a clash, we stop here so the same slot cannot be booked twice.
      // That error bubbles back to the booking page and shows up as a friendly message.
      throw new Error("That time slot is already booked.");
    }

    let assignedStylistName: string | null = null;
    if (args.assignedStylistId) {
      const stylist = await ctx.db.get(args.assignedStylistId);
      assignedStylistName = stylist ? stylist.name : null;
    }

    return await ctx.db.insert("appointments", {
      userId: args.userId,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
      serviceId: args.serviceId,
      serviceName: service.name,
      serviceSlug: service.slug,
      servicePriceCents: service.priceCents,
      serviceDurationMinutes: service.durationMinutes,
      appointmentDate: args.appointmentDate,
      appointmentTimeLabel: args.appointmentTimeLabel,
      startMinutes,
      endMinutes,
      location: appointmentLocation,
      notes: args.notes,
      status: "pending",
      assignedStylistId: args.assignedStylistId,
      assignedStylistName,
      source: args.source,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const updateAppointmentStatus = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    assignedStylistId: v.optional(v.union(v.id("stylists"), v.null())),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    // The assigned stylist can change at the same time as the booking status.
    // Keeping both fields together prevents the dashboard from showing half-updated cards.
    let assignedStylistName = appointment.assignedStylistName;
    let assignedStylistId = appointment.assignedStylistId;

    if (args.assignedStylistId !== undefined) {
      assignedStylistId = args.assignedStylistId;
      if (args.assignedStylistId) {
        const stylist = await ctx.db.get(args.assignedStylistId);
        assignedStylistName = stylist ? stylist.name : null;
      } else {
        assignedStylistName = null;
      }
    }

    await ctx.db.patch(args.appointmentId, {
      status: args.status,
      assignedStylistId,
      assignedStylistName,
      updatedAt: args.updatedAt,
    });

    return args.appointmentId;
  },
});

export const createReview = internalMutation({
  args: {
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    rating: v.number(),
    mainQuote: v.string(),
    subQuote1: v.string(),
    subQuote2: v.string(),
    serviceId: v.union(v.id("services"), v.null()),
    serviceName: v.union(v.string(), v.null()),
    avatarUrl: v.string(),
    featured: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // New reviews always start hidden until the admin approves them.
    let serviceName = args.serviceName;
    if (!serviceName && args.serviceId) {
      const service = await ctx.db.get(args.serviceId);
      serviceName = service ? service.name : null;
    }

    return await ctx.db.insert("reviews", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      role: args.role,
      rating: args.rating,
      mainQuote: args.mainQuote,
      subQuote1: args.subQuote1,
      subQuote2: args.subQuote2,
      serviceId: args.serviceId,
      serviceName,
      avatarUrl: args.avatarUrl,
      featured: args.featured,
      isApproved: false,
      sortOrder: args.sortOrder,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const updateReviewModeration = internalMutation({
  args: {
    reviewId: v.id("reviews"),
    isApproved: v.boolean(),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // The admin dashboard uses this when it approves or hides a review.
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found.");
    }

    // Unchanged feature and sort values survive so the admin only edits what they touched.
    await ctx.db.patch(args.reviewId, {
      isApproved: args.isApproved,
      featured: args.featured ?? review.featured,
      sortOrder: args.sortOrder ?? review.sortOrder,
      updatedAt: args.updatedAt,
    });

    return args.reviewId;
  },
});

export const createGalleryItem = internalMutation({
  args: {
    title: v.string(),
    category: v.string(),
    caption: v.string(),
    altText: v.string(),
    imageUrl: v.union(v.string(), v.null()),
    storageId: v.union(v.id("_storage"), v.null()),
    featured: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Admin uploads end up here, either with a file upload or a saved image URL.
    // At least one image source has to exist or the gallery tile would be empty.
    if (!args.imageUrl && !args.storageId) {
      throw new Error("Gallery items require either an image URL or an uploaded file.");
    }

    // The gallery table stores the visual content plus the metadata needed for sorting and captions.

    return await ctx.db.insert("galleryItems", {
      title: args.title,
      category: args.category,
      caption: args.caption,
      altText: args.altText,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
      featured: args.featured,
      active: true,
      sortOrder: args.sortOrder,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const createPromotion = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    code: v.string(),
    imageUrl: v.string(),
    tag: v.string(),
    discountText: v.string(),
    featured: v.boolean(),
    active: v.boolean(),
    sortOrder: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    offerType: v.union(v.literal("LIMITED_EXCLUSIVE"), v.literal("CURRENT_SPECIAL")),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (existing) {
      throw new Error("A promotion with that code already exists.");
    }

    return await ctx.db.insert("promotions", {
      title: args.title,
      description: args.description,
      code: args.code,
      imageUrl: args.imageUrl,
      tag: args.tag,
      discountText: args.discountText,
      featured: args.featured,
      active: args.active,
      sortOrder: args.sortOrder,
      startDate: args.startDate,
      endDate: args.endDate,
      offerType: args.offerType,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const updatePromotion = internalMutation({
  args: {
    promotionId: v.id("promotions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    code: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tag: v.optional(v.string()),
    discountText: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    offerType: v.optional(v.union(v.literal("LIMITED_EXCLUSIVE"), v.literal("CURRENT_SPECIAL"))),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const promotion = await ctx.db.get(args.promotionId);
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    if (args.code && args.code !== promotion.code) {
      const existing = await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", args.code as string))
        .unique();
      if (existing && existing._id.toString() !== args.promotionId.toString()) {
        throw new Error("A promotion with that code already exists.");
      }
    }

    await ctx.db.patch(args.promotionId, {
      title: args.title ?? promotion.title,
      description: args.description ?? promotion.description,
      code: args.code ?? promotion.code,
      imageUrl: args.imageUrl ?? promotion.imageUrl,
      tag: args.tag ?? promotion.tag,
      discountText: args.discountText ?? promotion.discountText,
      featured: args.featured ?? promotion.featured,
      active: args.active ?? promotion.active,
      sortOrder: args.sortOrder ?? promotion.sortOrder,
      startDate: args.startDate ?? promotion.startDate,
      endDate: args.endDate ?? promotion.endDate,
      offerType: args.offerType ?? promotion.offerType,
      updatedAt: args.updatedAt,
    });

    return args.promotionId;
  },
});

export const deletePromotion = internalMutation({
  args: {
    promotionId: v.id("promotions"),
  },
  handler: async (ctx, args) => {
    const promotion = await ctx.db.get(args.promotionId);
    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    await ctx.db.delete(args.promotionId);
    return { promotionId: args.promotionId };
  },
});

export const deleteAppointment = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    // Hard delete removes the appointment from the database completely.
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    // Remove the appointment record
    await ctx.db.delete(args.appointmentId);

    return { appointmentId: args.appointmentId };
  },
});

export const deleteReview = internalMutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    // Hard delete removes the review from the database completely.
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found.");
    }

    // Remove the review record
    await ctx.db.delete(args.reviewId);

    return { reviewId: args.reviewId };
  },
});

export const moveAppointmentToCompleted = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Move appointment to completedAppointments table and remove from appointments
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    // Insert into completedAppointments
    await ctx.db.insert("completedAppointments", {
      userId: appointment.userId,
      guestName: appointment.guestName,
      guestEmail: appointment.guestEmail,
      guestPhone: appointment.guestPhone,
      serviceId: appointment.serviceId,
      serviceName: appointment.serviceName,
      serviceSlug: appointment.serviceSlug,
      servicePriceCents: appointment.servicePriceCents,
      serviceDurationMinutes: appointment.serviceDurationMinutes,
      appointmentDate: appointment.appointmentDate,
      appointmentTimeLabel: appointment.appointmentTimeLabel,
      startMinutes: appointment.startMinutes,
      endMinutes: appointment.endMinutes,
      location: appointment.location,
      notes: appointment.notes,
      assignedStylistId: appointment.assignedStylistId,
      assignedStylistName: appointment.assignedStylistName,
      source: appointment.source,
      completedAt: args.completedAt,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    });

    // Remove from appointments
    await ctx.db.delete(args.appointmentId);

    return { appointmentId: args.appointmentId };
  },
});

export const migratePromotionsOfferType = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Migrate all existing promotions to have offerType
    // If offerType is missing, assign based on featured flag:
    // - featured=true → LIMITED_EXCLUSIVE
    // - featured=false → CURRENT_SPECIAL
    
    const allPromotions = await ctx.db.query("promotions").collect();
    let migratedCount = 0;

    for (const promotion of allPromotions) {
      const promotionDoc = promotion as any;
      if (!promotionDoc.offerType) {
        const offerType = promotionDoc.featured ? "LIMITED_EXCLUSIVE" : "CURRENT_SPECIAL";
        await ctx.db.patch(promotion._id, { offerType });
        migratedCount++;
      }
    }

    return { migratedCount, totalPromotions: allPromotions.length };
  },
});
