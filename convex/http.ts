import { httpAction, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { httpRouter } from "convex/server";
import type { Id } from "./_generated/dataModel";
import {
  emptyResponse,
  getBearerToken,
  hashPassword,
  jsonResponse,
  normalizeEmail,
  randomToken,
  readJson,
  sha256Hex,
  verifyPassword,
} from "./utils";
import { defaultAppointmentLocation } from "./seedData";

// This file is the public door into Convex.
// The React app calls these routes, and these routes call the Convex database.
type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  preferredLocation: string | null;
  skinPreferences: string[];
  allergies: string[];
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: number | null;
  createdAt: number;
  updatedAt: number;
};

type SessionContext = {
  token: string;
  user: PublicUser;
};

const http = httpRouter();

function sanitizeUser(user: {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  preferredLocation?: string;
  skinPreferences?: string[];
  allergies?: string[];
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}): PublicUser {
  // This trims the private fields away before the frontend sees the user.
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    preferredLocation: user.preferredLocation ?? null,
    skinPreferences: user.skinPreferences ?? [],
    allergies: user.allergies ?? [],
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function statusFromError(message: string): number {
  // Convert common backend failures into the right HTTP response code.
  if (message.includes("Authentication required")) {
    return 401;
  }
  if (message.includes("Admin access required")) {
    return 403;
  }
  if (
    message.includes("already exists") ||
    message.includes("already booked") ||
    message.includes("already approved")
  ) {
    return 409;
  }
  if (message.includes("not found")) {
    return 404;
  }
  if (
    message.includes("Invalid") ||
    message.includes("required") ||
    message.includes("missing") ||
    message.includes("not part of the booking schedule") ||
    message.includes("outside the booking schedule") ||
    message.includes("outside the booking hours") ||
    message.includes("booking hours")
  ) {
    return 400;
  }
  return 400;
}

function normalizeStringList(value: unknown): string[] | undefined {
  // The forms sometimes send arrays and sometimes plain text, so both are accepted.
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => String(item).trim())
      .filter((item) => Boolean(item));
    return cleaned;
  }

  if (typeof value === "string") {
    const cleaned = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => Boolean(item));
    return cleaned;
  }

  return undefined;
}

function getPathSuffix(pathname: string, prefix: string): string | null {
  // This pulls the id out of a URL like /api/reviews/<id>.
  if (!pathname.startsWith(prefix)) {
    return null;
  }
  const suffix = pathname.slice(prefix.length);
  if (!suffix || suffix.includes("/")) {
    return null;
  }
  return suffix;
}

async function getSessionContext(ctx: any, request: Request): Promise<SessionContext | null> {
  // The app sends a Bearer token here. We hash it and look up the matching session.
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const tokenHash = await sha256Hex(token);
  const session = await ctx.runQuery(internal.data.findSessionByTokenHash, { tokenHash });
  if (!session || session.revoked || session.expiresAt < Date.now()) {
    // Expired or revoked sessions are treated the same as a missing session.
    return null;
  }

  const user = await ctx.runQuery(internal.data.getUserById, { userId: session.userId });
  if (!user || !user.isActive) {
    return null;
  }

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function requireAdmin(ctx: any, request: Request): Promise<SessionContext | null> {
  // Admin routes reuse the same session check, then add a role check on top.
  const session = await getSessionContext(ctx, request);
  if (!session || session.user.role !== "admin") {
    // A valid customer account still cannot reach the admin tools.
    return null;
  }
  return session;
}

function mergeAppointmentBody(body: {
  fullName?: string;
  name?: string;
  guestName?: string;
  email?: string;
  guestEmail?: string;
  phone?: string;
  guestPhone?: string;
  serviceId?: string;
  appointmentDate?: string;
  date?: string;
  appointmentTime?: string;
  time?: string;
  location?: string;
  info?: string;
  notes?: string;
  assignedStylistId?: string | null;
}) {
  // Booking forms in the UI use a couple of different names, so this normalizes them once.
  return {
    guestName: (body.fullName ?? body.name ?? body.guestName ?? "").trim(),
    guestEmail: (body.email ?? body.guestEmail ?? "").trim(),
    guestPhone: (body.phone ?? body.guestPhone ?? "").trim(),
    serviceId: (body.serviceId ?? "").trim(),
    appointmentDate: (body.appointmentDate ?? body.date ?? "").trim(),
    appointmentTimeLabel: (body.appointmentTime ?? body.time ?? "").trim(),
    location: defaultAppointmentLocation,
    notes: (body.info ?? body.notes ?? "").trim(),
    assignedStylistId: typeof body.assignedStylistId === "string" && body.assignedStylistId.trim() ? body.assignedStylistId.trim() : null,
  };
}

// This route lets the frontend confirm which account is signed in.
http.route({
  path: "/api/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const session = await getSessionContext(ctx, request);
    if (!session) {
      return jsonResponse({ ok: false, error: "Authentication required." }, 401);
    }

    // The frontend only gets the sanitized public user object, never the session internals.
    return jsonResponse({ ok: true, data: session.user });
  }),
});

// Browsers send a preflight OPTIONS request first, so this keeps cross-origin calls working.
http.route({
  pathPrefix: "/api/",
  method: "OPTIONS",
  handler: httpAction(async () => emptyResponse(204)),
});

// Public salon data and auth routes start here.
http.route({
  path: "/api/business",
  method: "GET",
  handler: httpAction(async (ctx) => {
    // The public site reads the salon profile from here.
    const profile = await ctx.runQuery(internal.data.getBusinessProfile, {});
    if (!profile) {
      return jsonResponse({ ok: false, error: "Business profile not initialized." }, 404);
    }
    return jsonResponse({ ok: true, data: profile });
  }),
});

http.route({
  path: "/api/services",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // When a slug is present, this route returns one service instead of the full list.
      const url = new URL(request.url);
      const slug = url.searchParams.get("slug");
      if (slug) {
        const service = await ctx.runQuery(internal.data.getServiceBySlug, { slug });
        if (!service) {
          return jsonResponse({ ok: false, error: "Service not found." }, 404);
        }
        return jsonResponse({ ok: true, data: service });
      }

      const services = await ctx.runQuery(internal.data.listServices, {});
      return jsonResponse({ ok: true, data: services });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load services.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/staff",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      // The stylists page only needs the public staff cards.
      const staff = await ctx.runQuery(internal.data.listStaff, {});
      return jsonResponse({ ok: true, data: staff });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load staff.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/gallery",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      // Gallery content is public, so no session is required here.
      const gallery = await ctx.runQuery(internal.data.listGallery, {});
      return jsonResponse({ ok: true, data: gallery });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load gallery.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/reviews",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      // Only approved testimonials are exposed to the frontend.
      const reviews = await ctx.runQuery(internal.data.listApprovedReviews, {});
      return jsonResponse({ ok: true, data: reviews });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load reviews.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/promotions",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      // The offers page and homepage both read from this promotion list.
      const promotions = await ctx.runQuery(internal.data.listPromotions, {});
      return jsonResponse({ ok: true, data: promotions });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load promotions.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/admin/promotions",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      const promotions = await ctx.runQuery(internal.data.listPromotionsForAdmin, {});
      return jsonResponse({ ok: true, data: promotions });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load promotions.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/admin/promotions",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      const body = await readJson<{
        title?: string;
        description?: string;
        code?: string;
        imageUrl?: string;
        tag?: string;
        discountText?: string;
        featured?: boolean;
        active?: boolean;
        sortOrder?: number;
        startDate?: string;
        endDate?: string;
        offerType?: string;
      }>(request);

      if (!body.title || !body.description || !body.code || !body.imageUrl) {
        return jsonResponse({ ok: false, error: "Title, description, code, and image are required." }, 400);
      }

      const offerType = (body.offerType === "LIMITED_EXCLUSIVE" || body.offerType === "CURRENT_SPECIAL") ? body.offerType : "CURRENT_SPECIAL";

      const promotionId = await (ctx as any).runMutation(internal.data.createPromotion, {
        title: body.title.trim(),
        description: body.description.trim(),
        code: body.code.trim().toUpperCase(),
        imageUrl: body.imageUrl.trim(),
        tag: (body.tag ?? "Featured").trim() || "Featured",
        discountText: (body.discountText ?? "").trim(),
        featured: Boolean(body.featured ?? true),
        active: Boolean(body.active ?? true),
        sortOrder: Number(body.sortOrder ?? Date.now()),
        startDate: (body.startDate ?? "2025-01-01").trim(),
        endDate: (body.endDate ?? "2026-12-31").trim(),
        offerType,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const promotions = await (ctx as any).runQuery(internal.data.listPromotionsForAdmin, {});
      const created = (promotions as any[]).find((item: { id: string }) => item.id === promotionId) ?? null;
      return jsonResponse({ ok: true, data: created }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create promotion.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  pathPrefix: "/api/admin/promotions/",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      const pathname = new URL(request.url).pathname;
      const promotionId = getPathSuffix(pathname, "/api/admin/promotions/");
      if (!promotionId) {
        return jsonResponse({ ok: false, error: "Promotion id is required." }, 400);
      }

      const body = await readJson<{
        title?: string;
        description?: string;
        code?: string;
        imageUrl?: string;
        tag?: string;
        discountText?: string;
        featured?: boolean;
        active?: boolean;
        sortOrder?: number;
        startDate?: string;
        endDate?: string;
        offerType?: string;
      }>(request);

      const offerType = (body.offerType === "LIMITED_EXCLUSIVE" || body.offerType === "CURRENT_SPECIAL") ? body.offerType : undefined;

      await (ctx as any).runMutation(internal.data.updatePromotion, {
        promotionId: promotionId as Id<"promotions">,
        title: body.title?.trim(),
        description: body.description?.trim(),
        code: body.code?.trim().toUpperCase(),
        imageUrl: body.imageUrl?.trim(),
        tag: body.tag?.trim(),
        discountText: body.discountText?.trim(),
        featured: typeof body.featured === "boolean" ? body.featured : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
        startDate: body.startDate?.trim(),
        endDate: body.endDate?.trim(),
        offerType,
        updatedAt: Date.now(),
      });

      const promotions = await (ctx as any).runQuery(internal.data.listPromotionsForAdmin, {});
      const updated = (promotions as any[]).find((item: { id: string }) => item.id === promotionId) ?? null;
      return jsonResponse({ ok: true, data: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update promotion.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  pathPrefix: "/api/admin/promotions/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      const pathname = new URL(request.url).pathname;
      const promotionId = getPathSuffix(pathname, "/api/admin/promotions/");
      if (!promotionId) {
        return jsonResponse({ ok: false, error: "Promotion id is required." }, 400);
      }

      const result = await (ctx as any).runMutation(internal.data.deletePromotion, {
        promotionId: promotionId as Id<"promotions">,
      });

      return jsonResponse({ ok: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete promotion.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  path: "/api/availability",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // The booking page asks for open slots on a specific date.
      const url = new URL(request.url);
      const appointmentDate = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
      const serviceIdParam = url.searchParams.get("serviceId");
      const serviceId = serviceIdParam && serviceIdParam !== "null" ? serviceIdParam : null;
      // If no service is selected, Convex still answers with the day-based opening pattern.
      const availability = await ctx.runQuery(internal.data.getAvailability, {
        appointmentDate,
        serviceId: serviceId as Id<"services"> | null,
      });
      return jsonResponse({ ok: true, data: availability });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load availability.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  path: "/api/auth/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Registration creates the customer record and the first session token.
      const body = await readJson<{
        fullName?: string;
        email?: string;
        phone?: string;
        password?: string;
        preferredLocation?: string;
        skinPreferences?: unknown;
        allergies?: unknown;
      }>(request);

      if (!body.fullName || !body.email || !body.phone || !body.password) {
        return jsonResponse({ ok: false, error: "Full name, email, phone, and password are required." }, 400);
      }

      const normalizedEmail = normalizeEmail(body.email);
      const existingUser = await ctx.runQuery(internal.data.findUserByEmail, { email: normalizedEmail });
      if (existingUser) {
        return jsonResponse({ ok: false, error: "A user with that email already exists." }, 409);
      }

      const { salt, passwordHash } = await hashPassword(body.password);
      // Optional lists are normalized here so textarea input behaves like structured data.
      const skinPreferences = normalizeStringList(body.skinPreferences);
      const allergies = normalizeStringList(body.allergies);
      const now = Date.now();
      const userId = await ctx.runMutation(internal.data.createUser, {
        fullName: body.fullName.trim(),
        email: normalizedEmail,
        phone: body.phone.trim(),
        passwordHash,
        passwordSalt: salt,
        role: "customer",
        preferredLocation: body.preferredLocation?.trim() || undefined,
        skinPreferences,
        allergies,
        emailVerified: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      // The browser stores the raw token, but Convex only stores the hash.
      await ctx.runMutation(internal.data.createSession, {
        userId,
        tokenHash,
        expiresAt: now + 1000 * 60 * 60 * 24 * 30,
        createdAt: now,
        lastUsedAt: now,
      });
      const user = await ctx.runQuery(internal.data.getUserById, { userId });

      if (!user) {
        return jsonResponse({ ok: false, error: "Unable to create user." }, 500);
      }

      return jsonResponse({ ok: true, data: { token, user: sanitizeUser(user) } }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to register user.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  path: "/api/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Login checks the password, then returns a fresh browser session.
      const body = await readJson<{ email?: string; password?: string }>(request);
      if (!body.email || !body.password) {
        return jsonResponse({ ok: false, error: "Email and password are required." }, 400);
      }

      const normalizedEmail = normalizeEmail(body.email);
      const user = await ctx.runQuery(internal.data.findUserByEmail, { email: normalizedEmail });
      if (!user) {
        return jsonResponse({ ok: false, error: "Invalid email or password." }, 401);
      }
      if (!user.isActive) {
        return jsonResponse({ ok: false, error: "This account is disabled." }, 403);
      }

      // Password verification happens against the stored salt and hash pair.
      const validPassword = await verifyPassword(body.password, user.passwordSalt, user.passwordHash);
      if (!validPassword) {
        return jsonResponse({ ok: false, error: "Invalid email or password." }, 401);
      }

      const now = Date.now();
      // Touching the login timestamp lets the dashboard show when the user last came back.
      await (ctx as any).runMutation(internal.data.touchUserLogin, {
        userId: user._id,
        lastLoginAt: now,
      });

      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      await (ctx as any).runMutation(internal.data.createSession, {
        userId: user._id,
        tokenHash,
        expiresAt: now + 1000 * 60 * 60 * 24 * 30,
        createdAt: now,
        lastUsedAt: now,
      });

      const refreshedUser = await (ctx as any).runQuery(internal.data.getUserById, { userId: user._id });
      if (!refreshedUser) {
        return jsonResponse({ ok: false, error: "Unable to load account details." }, 500);
      }

      return jsonResponse({ ok: true, data: { token, user: sanitizeUser(refreshedUser) } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({  path: "/api/appointments",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Appointments are protected so the booking always belongs to a signed-in user.
      const auth = await getSessionContext(ctx, request);
      if (!auth) {
        return jsonResponse({ ok: false, error: "Authentication required." }, 401);
      }

      const body = mergeAppointmentBody(await readJson<Record<string, unknown>>(request));
      if (!body.guestName || !body.guestEmail || !body.guestPhone || !body.serviceId || !body.appointmentDate || !body.appointmentTimeLabel) {
        return jsonResponse(
          { ok: false, error: "Name, email, phone, service, date, and time are required." },
          400,
        );
      }

      const userId = auth.user.id as Id<"users">;
      const user = await (ctx as any).runQuery(internal.data.getUserById, { userId });
      // The signed-in profile wins, but the form still supplies a fallback for display.
      // That way the booking stays usable even if the cached browser state is stale.
      const finalName = user?.fullName || body.guestName || "";
      const finalEmail = user?.email || body.guestEmail || "";
      const finalPhone = user?.phone || body.guestPhone || "";

      const appointmentId = await (ctx as any).runMutation(internal.data.createAppointment, {
        userId,
        guestName: finalName,
        guestEmail: finalEmail,
        guestPhone: finalPhone,
        serviceId: body.serviceId as Id<"services">,
        appointmentDate: body.appointmentDate,
        appointmentTimeLabel: body.appointmentTimeLabel,
        location: body.location,
        notes: body.notes,
        assignedStylistId: body.assignedStylistId as Id<"stylists"> | null,
        source: "website",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const appointment = await (ctx as any).runQuery(internal.data.getAppointmentById, { appointmentId });
      return jsonResponse({ ok: true, data: appointment }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create appointment.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

// This gives the signed-in customer their own appointment list.
http.route({
  path: "/api/appointments/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await getSessionContext(ctx, request);
    if (!auth) {
      return jsonResponse({ ok: false, error: "Authentication required." }, 401);
    }

    try {
      // This gives the logged-in customer their own bookings.
      const appointments = await (ctx as any).runQuery(internal.data.listAppointmentsForUser, {
        userId: auth.user.id as Id<"users">,
      });
      return jsonResponse({ ok: true, data: { user: auth.user, appointments } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load appointments.";
      return jsonResponse({ ok: false, error: message }, 500);
    }
  }),
});

http.route({
  pathPrefix: "/api/appointments/",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // The admin dashboard uses this route to change booking state.
      const pathname = new URL(request.url).pathname;
      const appointmentId = getPathSuffix(pathname, "/api/appointments/");
      if (!appointmentId) {
        return jsonResponse({ ok: false, error: "Appointment id is required." }, 400);
      }

      const body = await readJson<{
        status?: "pending" | "confirmed" | "cancelled" | "completed";
        assignedStylistId?: string | null;
      }>(request);

      if (!body.status) {
        return jsonResponse({ ok: false, error: "Status is required." }, 400);
      }

      // Admins can update the state and optionally attach a stylist in the same request.
      const updatedAppointmentId = await (ctx as any).runMutation(internal.data.updateAppointmentStatus, {
        appointmentId: appointmentId as Id<"appointments">,
        status: body.status,
        assignedStylistId:
          typeof body.assignedStylistId === "string"
            ? (body.assignedStylistId.trim() as Id<"stylists"> || null)
            : body.assignedStylistId === null
              ? null
              : undefined,
        updatedAt: Date.now(),
      });

      const appointment = await (ctx as any).runQuery(internal.data.getAppointmentById, {
        appointmentId: updatedAppointmentId,
      });

      return jsonResponse({ ok: true, data: appointment });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update appointment.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

// Catch-all API routes for unhandled methods/paths under /api/
// This ensures responses always include the CORS headers so browsers do not block
// client-side code with a missing Access-Control-Allow-Origin header on 404s.
["GET", "POST", "PUT", "DELETE"].forEach((m) => {
  http.route({
    pathPrefix: "/api/",
    method: m as any,
    handler: httpAction(async () => {
      return jsonResponse({ ok: false, error: "Not found" }, 404);
    }),
  });
});

http.route({
  path: "/api/reviews",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Review submissions stay attached to the signed-in account.
      const auth = await getSessionContext(ctx, request);
      if (!auth) {
        return jsonResponse({ ok: false, error: "Authentication required." }, 401);
      }

      const body = await readJson<Record<string, unknown>>(request);
      // These fallback values let the form stay usable even when some optional fields are blank.
      const name = String(auth.user.fullName ?? body.name ?? body.fullName ?? "").trim();
      const email = String(auth.user.email ?? body.email ?? "").trim();
      const role = String(body.role ?? body.serviceRole ?? "Client").trim();
      const rating = Number(body.rating ?? 5);
      const mainQuote = String(body.mainQuote ?? body.quote ?? "").trim();
      const subQuote1 = String(body.subQuote1 ?? body.details1 ?? "").trim();
      const subQuote2 = String(body.subQuote2 ?? body.details2 ?? "").trim();
      const avatarUrl = String(
        body.avatarUrl ??
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
      ).trim();
      // The avatar falls back to a consistent stock image so the cards stay visually balanced.
      const serviceId = typeof body.serviceId === "string" && body.serviceId.trim() ? body.serviceId.trim() : null;
      const serviceName = typeof body.serviceName === "string" && body.serviceName.trim() ? body.serviceName.trim() : null;

      if (!name || !email || !mainQuote || !subQuote1 || !subQuote2) {
        return jsonResponse({ ok: false, error: "Name, email, and review text are required." }, 400);
      }

      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        return jsonResponse({ ok: false, error: "Rating must be between 1 and 5." }, 400);
      }

      const reviewId = await (ctx as any).runMutation(internal.data.createReview, {
        userId: (auth ? auth.user.id : null) as Id<"users"> | null,
        name,
        email,
        role,
        rating,
        mainQuote,
        subQuote1,
        subQuote2,
        serviceId: serviceId as Id<"services"> | null,
        serviceName,
        avatarUrl,
        featured: Boolean(body.featured ?? false),
        sortOrder: Number(body.sortOrder ?? Date.now()),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return jsonResponse({ ok: true, data: { reviewId } }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create review.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  pathPrefix: "/api/reviews/",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // Moderation updates let admin staff approve or feature a review.
      const pathname = new URL(request.url).pathname;
      const reviewId = getPathSuffix(pathname, "/api/reviews/");
      if (!reviewId) {
        return jsonResponse({ ok: false, error: "Review id is required." }, 400);
      }

      const body = await readJson<{
        isApproved?: boolean;
        featured?: boolean;
        sortOrder?: number;
      }>(request);

      // Approval defaults to true so the admin can publish a review with a single click.
      const updatedReviewId = await (ctx as any).runMutation(internal.data.updateReviewModeration, {
        reviewId: reviewId as Id<"reviews">,
        isApproved: body.isApproved ?? true,
        featured: body.featured,
        sortOrder: body.sortOrder,
        updatedAt: Date.now(),
      });

      return jsonResponse({ ok: true, data: { reviewId: updatedReviewId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update review.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

// The dashboard uses these read routes to inspect bookings and reviews.
http.route({
  path: "/api/admin/appointments",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    // The dashboard pulls the full appointment list from this route.
    const appointments = await ctx.runQuery(internal.data.listAppointmentsForAdmin, { limit: 100 });
    return jsonResponse({ ok: true, data: appointments });
  }),
});

http.route({
  path: "/api/admin/reviews",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    // The dashboard pulls the review moderation queue from here.
    const reviews = await ctx.runQuery(internal.data.listReviewsForAdmin, { limit: 100 });
    return jsonResponse({ ok: true, data: reviews });
  }),
});

http.route({
  path: "/api/gallery/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // Uploads are admin-only because they change what visitors see publicly.
      const url = new URL(request.url);
      const contentType = request.headers.get("content-type") ?? "";

      let title = url.searchParams.get("title")?.trim() ?? "Uploaded Image";
      let category = url.searchParams.get("category")?.trim() ?? "Gallery";
      let caption = url.searchParams.get("caption")?.trim() ?? "";
      let altText = url.searchParams.get("altText")?.trim() ?? title;
      let imageUrl: string | null = url.searchParams.get("imageUrl")?.trim() || null;
      const featured = url.searchParams.get("featured") === "true";
      const sortOrder = Number(url.searchParams.get("sortOrder") ?? Date.now());
      let storageId: string | null = null;

      if (contentType.includes("application/json")) {
        // JSON uploads are usually plain image links pasted from the dashboard.
        const body = await readJson<Record<string, unknown>>(request);
        title = String(body.title ?? title).trim();
        category = String(body.category ?? category).trim();
        caption = String(body.caption ?? caption).trim();
        altText = String(body.altText ?? altText).trim();
        imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : imageUrl;
      } else if (contentType.includes("image/") || contentType.includes("application/octet-stream") || !contentType) {
        // Binary uploads are stored directly in Convex storage and linked from the gallery row.
        const blob = await request.blob();
        if (blob.size > 0) {
          storageId = await (ctx as any).storage.store(blob);
        }
      }

      // The upload can be stored either as a URL reference or a Convex storage file.

      if (!title || !category) {
        return jsonResponse({ ok: false, error: "Title and category are required." }, 400);
      }

      const galleryItemId = await (ctx as any).runMutation(internal.data.createGalleryItem, {
        title,
        category,
        caption,
        altText,
        imageUrl,
        storageId: storageId as Id<"_storage"> | null,
        featured,
        sortOrder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const gallery = await (ctx as any).runQuery(internal.data.listGallery, {});
      const createdItem = (gallery as any[]).find((item: { id: string }) => item.id === galleryItemId) ?? null;

      return jsonResponse({ ok: true, data: createdItem }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload gallery item.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

// Delete routes for hard-deleting appointments and reviews
http.route({
  pathPrefix: "/api/appointments/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // Extract appointment ID from URL path
      const pathname = new URL(request.url).pathname;
      const appointmentId = getPathSuffix(pathname, "/api/appointments/");
      if (!appointmentId) {
        return jsonResponse({ ok: false, error: "Appointment id is required." }, 400);
      }

      // Delete the appointment from database
      const result = await (ctx as any).runMutation(internal.data.deleteAppointment, {
        appointmentId: appointmentId as Id<"appointments">,
      });

      return jsonResponse({ ok: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete appointment.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  pathPrefix: "/api/reviews/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // Extract review ID from URL path
      const pathname = new URL(request.url).pathname;
      const reviewId = getPathSuffix(pathname, "/api/reviews/");
      if (!reviewId) {
        return jsonResponse({ ok: false, error: "Review id is required." }, 400);
      }

      // Delete the review from database
      const result = await (ctx as any).runMutation(internal.data.deleteReview, {
        reviewId: reviewId as Id<"reviews">,
      });

      return jsonResponse({ ok: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete review.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

http.route({
  path: "/api/appointments/complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const admin = await requireAdmin(ctx, request);
    if (!admin) {
      return jsonResponse({ ok: false, error: "Admin access required." }, 403);
    }

    try {
      // This endpoint moves a completed appointment to the completedAppointments archive table
      const body = await readJson<{ appointmentId?: string }>(request);
      if (!body.appointmentId) {
        return jsonResponse({ ok: false, error: "Appointment id is required." }, 400);
      }

      // Move appointment to completed archive
      const result = await (ctx as any).runMutation(internal.data.moveAppointmentToCompleted, {
        appointmentId: body.appointmentId as Id<"appointments">,
        completedAt: Date.now(),
      });

      return jsonResponse({ ok: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to archive completed appointment.";
      return jsonResponse({ ok: false, error: message }, statusFromError(message));
    }
  }),
});

export default http;


