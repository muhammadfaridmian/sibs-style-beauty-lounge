import { mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  defaultAdminCredentials,
  defaultAppointmentLocation,
  defaultBusinessProfile,
  defaultGalleryItems,
  defaultPromotions,
  defaultReviews,
  defaultServices,
  defaultStylists,
} from "./seedData";
import { hashPassword, normalizeEmail } from "./utils";

export const seedDefaults = mutation({
  args: {
    overwriteBusinessProfile: v.optional(v.boolean()),
    overwriteSeedContent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const overwriteSeedContent = args.overwriteSeedContent ?? false;
    const summary = {
      businessProfile: 0,
      services: 0,
      stylists: 0,
      galleryItems: 0,
      reviews: 0,
      promotions: 0,
      adminUser: 0,
    };

    const existingBusinessProfile = await ctx.db.query("businessProfile").take(1);
    if (existingBusinessProfile.length === 0) {
      await ctx.db.insert("businessProfile", {
        ...defaultBusinessProfile,
        createdAt: now,
        updatedAt: now,
      });
      summary.businessProfile = 1;
    } else if (args.overwriteBusinessProfile || overwriteSeedContent) {
      await ctx.db.patch(existingBusinessProfile[0]._id, {
        ...defaultBusinessProfile,
        updatedAt: now,
      });
      summary.businessProfile = 1;
    }

    const existingServices = await ctx.db.query("services").take(100);
    if (existingServices.length === 0) {
      for (const service of defaultServices) {
        await ctx.db.insert("services", {
          ...service,
          createdAt: now,
          updatedAt: now,
        });
        summary.services += 1;
      }
    } else if (overwriteSeedContent) {
      const servicesBySlug = new Map(existingServices.map((service) => [service.slug, service]));
      for (const service of defaultServices) {
        const existingService = servicesBySlug.get(service.slug);
        if (existingService) {
          await ctx.db.patch(existingService._id, {
            slug: service.slug,
            name: service.name,
            shortDescription: service.shortDescription,
            fullDescription: service.fullDescription,
            priceCents: service.priceCents,
            durationMinutes: service.durationMinutes,
            category: service.category,
            imageUrl: service.imageUrl,
            featured: service.featured,
            active: service.active,
            sortOrder: service.sortOrder,
            keyBenefits: service.keyBenefits,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("services", {
            ...service,
            createdAt: now,
            updatedAt: now,
          });
        }
        summary.services += 1;
      }
    }

    const existingStylists = await ctx.db.query("stylists").take(100);
    if (existingStylists.length === 0) {
      for (const stylist of defaultStylists) {
        await ctx.db.insert("stylists", {
          ...stylist,
          createdAt: now,
          updatedAt: now,
        });
        summary.stylists += 1;
      }
    } else if (overwriteSeedContent) {
      const stylistsByName = new Map(existingStylists.map((stylist) => [stylist.name, stylist]));
      for (const stylist of defaultStylists) {
        const existingStylist = stylistsByName.get(stylist.name);
        if (existingStylist) {
          await ctx.db.patch(existingStylist._id, {
            name: stylist.name,
            role: stylist.role,
            bio: stylist.bio,
            imageUrl: stylist.imageUrl,
            specialties: stylist.specialties,
            featured: stylist.featured,
            active: stylist.active,
            sortOrder: stylist.sortOrder,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("stylists", {
            ...stylist,
            createdAt: now,
            updatedAt: now,
          });
        }
        summary.stylists += 1;
      }
    }

    const existingGalleryItems = await ctx.db.query("galleryItems").take(100);
    if (existingGalleryItems.length === 0) {
      for (const item of defaultGalleryItems) {
        await ctx.db.insert("galleryItems", {
          ...item,
          imageUrl: item.imageUrl,
          storageId: null,
          createdAt: now,
          updatedAt: now,
        });
        summary.galleryItems += 1;
      }
    } else if (overwriteSeedContent) {
      const galleryByTitle = new Map(existingGalleryItems.map((item) => [item.title, item]));
      for (const item of defaultGalleryItems) {
        const existingItem = galleryByTitle.get(item.title);
        if (existingItem) {
          await ctx.db.patch(existingItem._id, {
            title: item.title,
            category: item.category,
            caption: item.caption,
            altText: item.altText,
            imageUrl: item.imageUrl,
            storageId: null,
            featured: item.featured,
            active: item.active,
            sortOrder: item.sortOrder,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("galleryItems", {
            ...item,
            imageUrl: item.imageUrl,
            storageId: null,
            createdAt: now,
            updatedAt: now,
          });
        }
        summary.galleryItems += 1;
      }
    }

    const existingReviews = await ctx.db.query("reviews").take(100);
    if (existingReviews.length === 0) {
      for (const review of defaultReviews) {
        await ctx.db.insert("reviews", {
          ...review,
          userId: null,
          serviceId: null,
          serviceName: review.serviceName,
          createdAt: now,
          updatedAt: now,
        });
        summary.reviews += 1;
      }
    } else if (overwriteSeedContent) {
      const reviewsByEmailAndOrder = new Map(
        existingReviews.map((review) => [`${review.email}:${review.sortOrder}`, review]),
      );
      for (const review of defaultReviews) {
        const existingReview = reviewsByEmailAndOrder.get(`${review.email}:${review.sortOrder}`);
        if (existingReview) {
          await ctx.db.patch(existingReview._id, {
            userId: null,
            name: review.name,
            email: review.email,
            role: review.role,
            rating: review.rating,
            mainQuote: review.mainQuote,
            subQuote1: review.subQuote1,
            subQuote2: review.subQuote2,
            serviceId: null,
            serviceName: review.serviceName,
            avatarUrl: review.avatarUrl,
            featured: review.featured,
            isApproved: review.isApproved,
            sortOrder: review.sortOrder,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("reviews", {
            ...review,
            userId: null,
            serviceId: null,
            serviceName: review.serviceName,
            createdAt: now,
            updatedAt: now,
          });
        }
        summary.reviews += 1;
      }
    }

    const existingPromotions = await ctx.db.query("promotions").take(100);
    if (existingPromotions.length === 0) {
      for (const promotion of defaultPromotions) {
        await ctx.db.insert("promotions", {
          ...promotion,
          createdAt: now,
          updatedAt: now,
        });
        summary.promotions += 1;
      }
    } else if (overwriteSeedContent) {
      const promotionsByCode = new Map(existingPromotions.map((promotion) => [promotion.code, promotion]));
      for (const promotion of defaultPromotions) {
        const existingPromotion = promotionsByCode.get(promotion.code);
        if (existingPromotion) {
          await ctx.db.patch(existingPromotion._id, {
            title: promotion.title,
            description: promotion.description,
            code: promotion.code,
            imageUrl: promotion.imageUrl,
            tag: promotion.tag,
            discountText: promotion.discountText,
            featured: promotion.featured,
            active: promotion.active,
            sortOrder: promotion.sortOrder,
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("promotions", {
            ...promotion,
            createdAt: now,
            updatedAt: now,
          });
        }
        summary.promotions += 1;
      }
    }

    const normalizedAdminEmail = normalizeEmail(defaultAdminCredentials.email);
    let existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedAdminEmail))
      .unique();
    if (!existingAdmin) {
      const existingUsers = await ctx.db.query("users").take(100);
      existingAdmin = existingUsers.find((user) => user.role === "admin") ?? null;
    }

    // This starter admin record keeps the dashboard ready on first launch.
    if (existingAdmin) {
      const { salt, passwordHash } = await hashPassword(defaultAdminCredentials.password);
      await ctx.db.patch(existingAdmin._id, {
        fullName: defaultAdminCredentials.fullName,
        email: normalizedAdminEmail,
        phone: defaultAdminCredentials.phone,
        passwordHash,
        passwordSalt: salt,
        role: "admin",
        preferredLocation: defaultAppointmentLocation,
        skinPreferences: [],
        allergies: [],
        emailVerified: true,
        isActive: true,
        updatedAt: now,
      });
      summary.adminUser = 1;
    } else {
      const { salt, passwordHash } = await hashPassword(defaultAdminCredentials.password);
      await ctx.db.insert("users", {
        fullName: defaultAdminCredentials.fullName,
        email: normalizedAdminEmail,
        phone: defaultAdminCredentials.phone,
        passwordHash,
        passwordSalt: salt,
        role: "admin",
        preferredLocation: defaultAppointmentLocation,
        skinPreferences: [],
        allergies: [],
        emailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      summary.adminUser = 1;
    }

    return summary;
  },
});
