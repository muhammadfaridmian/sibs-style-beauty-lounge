import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  businessProfile: defineTable({
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    email: v.string(),
    phone: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    timezone: v.string(),
    logoUrl: v.string(),
    socialInstagram: v.optional(v.string()),
    socialFacebook: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    weeklyHours: v.optional(v.object({
      monday: v.string(),
      tuesday: v.string(),
      wednesday: v.string(),
      thursday: v.string(),
      friday: v.string(),
      saturday: v.string(),
      sunday: v.string(),
    })),
    openingHours: v.object({
      mondayFriday: v.string(),
      saturday: v.string(),
      sunday: v.string(),
    }),
    standardSlots: v.array(v.string()),
    bookingLeadMinutes: v.number(),
    bookingIntervalMinutes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    role: v.union(v.literal("customer"), v.literal("admin")),
    preferredLocation: v.optional(v.string()),
    // This keeps customer care notes with the user record.
    skinPreferences: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    emailVerified: v.boolean(),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    lastUsedAt: v.number(),
    revoked: v.boolean(),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_userId", ["userId"]),

  services: defineTable({
    slug: v.string(),
    name: v.string(),
    shortDescription: v.string(),
    fullDescription: v.string(),
    priceCents: v.number(),
    durationMinutes: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    featured: v.boolean(),
    active: v.boolean(),
    sortOrder: v.number(),
    keyBenefits: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_category", ["category"])
    .index("by_featured_and_sortOrder", ["featured", "sortOrder"]),

  stylists: defineTable({
    name: v.string(),
    role: v.string(),
    bio: v.string(),
    imageUrl: v.string(),
    specialties: v.array(v.string()),
    featured: v.boolean(),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_featured_and_sortOrder", ["featured", "sortOrder"]),

  galleryItems: defineTable({
    title: v.string(),
    category: v.string(),
    caption: v.string(),
    altText: v.string(),
    imageUrl: v.optional(v.string()),
    storageId: v.union(v.id("_storage"), v.null()),
    featured: v.boolean(),
    active: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_featured_and_sortOrder", ["featured", "sortOrder"])
    .index("by_category", ["category"]),

  reviews: defineTable({
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
    isApproved: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isApproved_and_sortOrder", ["isApproved", "sortOrder"])
    .index("by_isApproved_and_createdAt", ["isApproved", "createdAt"])
    .index("by_serviceId", ["serviceId"]),

  promotions: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active_and_sortOrder", ["active", "sortOrder"])
    .index("by_featured_and_sortOrder", ["featured", "sortOrder"])
    .index("by_code", ["code"]),

  appointments: defineTable({
    userId: v.union(v.id("users"), v.null()),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.string(),
    serviceId: v.id("services"),
    serviceName: v.string(),
    serviceSlug: v.string(),
    servicePriceCents: v.number(),
    serviceDurationMinutes: v.number(),
    appointmentDate: v.string(),
    appointmentTimeLabel: v.string(),
    startMinutes: v.number(),
    endMinutes: v.number(),
    location: v.string(),
    notes: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    assignedStylistId: v.union(v.id("stylists"), v.null()),
    assignedStylistName: v.union(v.string(), v.null()),
    source: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date_and_startMinutes", ["appointmentDate", "startMinutes"])
    .index("by_userId_and_date", ["userId", "appointmentDate"])
    .index("by_status_and_date", ["status", "appointmentDate"])
    .index("by_serviceId_and_date", ["serviceId", "appointmentDate"]),
});
