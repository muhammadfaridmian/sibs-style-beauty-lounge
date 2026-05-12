/**
 * Convex API Configuration & Helpers
 * Central hub for all backend API calls
 * Base URL: https://proficient-akita-599.convex.site
 */

// This file is the bridge between React and Convex.
// It keeps the login token in localStorage and sends it when the route needs protection.
const API_BASE = "https://proficient-akita-599.convex.site";
const AUTH_TOKEN_KEY = "sibs-style-auth-token";
const AUTH_USER_KEY = "sibs-style-auth-user";

export interface AuthUser {
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
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

// ==================== TYPES ====================
export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  priceCents: number;
  durationMinutes: number;
  category: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  keyBenefits: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TimeSlot {
  timeLabel: string;
  available: boolean;
}

export interface Availability {
  date: string;
  slots: TimeSlot[];
  appointmentCount: number;
}

export interface Appointment {
  id: string;
  userId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  servicePriceCents: number;
  servicePrice: string;
  serviceDurationMinutes: number;
  appointmentDate: string;
  appointmentTimeLabel: string;
  appointmentTime: string;
  startMinutes: number;
  endMinutes: number;
  startTimeLabel: string;
  endTimeLabel: string;
  location: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  assignedStylistId: string | null;
  assignedStylistName: string | null;
  source: string;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  reviewId?: string;
  name: string;
  email: string;
  role: string;
  rating: number;
  mainQuote: string;
  subQuote1: string;
  subQuote2: string;
  avatarUrl: string;
  serviceName: string | null;
  isApproved: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdminAppointment extends Appointment {}

export interface AdminReview extends Review {}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  altText: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Promotion {
  id: string;
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
  createdAt: number;
  updatedAt: number;
}

export interface Stylist {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
  yearsOfExperience: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessProfile {
  id: string;
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
  openingHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
  standardSlots: string[];
  bookingLeadMinutes: number;
  bookingIntervalMinutes: number;
  createdAt: number;
  updatedAt: number;
}

function readStoredJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  // The app uses this for restoring session data after refreshes.
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  // This keeps the client-side cache in sync with the latest auth state.
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // The token itself stays in browser storage so every protected request can reuse it.
  // That keeps the session alive across page reloads without putting it into the backend.
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthSession(session: AuthSession) {
  // Save the safe user object and the token together so refreshes keep the session alive.
  writeStoredJson(AUTH_USER_KEY, session.user);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    // The custom event tells the navigation bar and pages that auth state changed.
    // It is how the header knows to switch between guest mode and signed-in mode instantly.
    window.dispatchEvent(new Event("sibs-style-auth-change"));
  }
}

export function clearStoredAuthSession() {
  // Logging out just clears the browser copy of the session.
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  // Clearing the session also notifies any components that depend on auth state.
  // Without this event the nav could still show stale user info until the next refresh.
  window.dispatchEvent(new Event("sibs-style-auth-change"));
}

export function getStoredAuthUser(): AuthUser | null {
  // This is the safe public user shape stored for quick UI startup.
  return readStoredJson<AuthUser>(AUTH_USER_KEY);
}

async function requestJson<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  // This helper adds JSON headers and the Bearer token when the route needs it.
  const headers = new Headers(init.headers ?? {});
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // Convex sends a small { ok, data, error } envelope, so we unwrap that here.
  // That keeps the rest of the frontend code focused on the business data instead of transport details.
  const payload = await response.json().catch(() => null) as { ok?: boolean; data?: T; error?: string } | null;
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || "Request failed");
  }

  return (payload?.data ?? null) as T;
}

// ==================== SERVICES ====================

/**
 * Fetch all active services
 * Used by: BookingPage, HomePage
 */
export async function getServices(): Promise<Service[]> {
  try {
    // Booking and home views both depend on the live service list.
    const response = await fetch(`${API_BASE}/api/services`);
    if (!response.ok) throw new Error("Failed to fetch services");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

/**
 * Fetch specific service by ID
 * Used by: Service detail views
 */
export async function getServiceById(serviceId: string): Promise<Service | null> {
  try {
    // This helper is a convenience for places that only know the id, not the slug.
    const services = await getServices();
    return services.find(s => s.id === serviceId) || null;
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    return null;
  }
}

// ==================== AVAILABILITY ====================

/**
 * Get available time slots for a specific date and service
 * Used by: BookingPage (Availability section)
 */
export async function getAvailability(date: string, serviceId?: string): Promise<Availability | null> {
  try {
    // The booking calendar needs the open slots for the selected day.
    const url = new URL(`${API_BASE}/api/availability`);
    url.searchParams.append("date", date);
    if (serviceId) url.searchParams.append("serviceId", serviceId);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch availability");
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return null;
  }
}

// ==================== APPOINTMENTS ====================

/**
 * Create a new appointment booking
 * Used by: BookingPage (Confirm Booking)
 */
export async function createAppointment(appointmentData: {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  info: string;
}, authToken: string | null = getStoredAuthToken()): Promise<Appointment | null> {
  try {
    if (!authToken) {
      throw new Error("Please sign in before booking a ritual.");
    }

    // This sends the booking form to the protected Convex route.
    return await requestJson<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    }, authToken);
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function login(credentials: { email: string; password: string }): Promise<AuthSession> {
  // Login returns the token plus the public user shape, then we store both.
  const session = await requestJson<AuthSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  setStoredAuthSession(session);
  return session;
}

export async function register(accountData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  preferredLocation?: string;
  skinPreferences?: string[];
  allergies?: string[];
}): Promise<AuthSession> {
  // Register does the same thing, but the backend also creates the customer record.
  const session = await requestJson<AuthSession>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(accountData),
  });
  setStoredAuthSession(session);
  return session;
}

export async function getCurrentAuthUser(authToken: string | null = getStoredAuthToken()): Promise<AuthUser | null> {
  if (!authToken) {
    return null;
  }

  try {
    // If Convex says the session is still valid, we trust that and keep the user signed in.
    return await requestJson<AuthUser>("/api/auth/me", { method: "GET" }, authToken);
  } catch (error) {
    console.error("Error loading auth session:", error);
    // If the live request fails, we fall back to the cached user so the app does not boot blank.
    return getStoredAuthUser();
  }
}

export async function getAdminAppointments(authToken: string | null = getStoredAuthToken()): Promise<AdminAppointment[]> {
  if (!authToken) {
    throw new Error("Please sign in before opening the admin dashboard.");
  }

  // The admin screen loads the current booking queue through this helper.
  return await requestJson<AdminAppointment[]>("/api/admin/appointments", { method: "GET" }, authToken);
}

export async function getAdminReviews(authToken: string | null = getStoredAuthToken()): Promise<AdminReview[]> {
  if (!authToken) {
    throw new Error("Please sign in before opening the admin dashboard.");
  }

  // The admin screen uses this to review pending testimonials.
  return await requestJson<AdminReview[]>("/api/admin/reviews", { method: "GET" }, authToken);
}

export async function updateAppointmentStatus(params: {
  appointmentId: string;
  status: Appointment["status"];
  assignedStylistId?: string | null;
  authToken?: string | null;
}): Promise<{ appointmentId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before updating bookings.");
  }

  // Status changes must go back to Convex so every page sees the same state.
  return await requestJson<{ appointmentId: string }>(`/api/appointments/${params.appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: params.status,
      assignedStylistId: params.assignedStylistId ?? null,
    }),
  }, authToken);
}

export async function moderateReview(params: {
  reviewId: string;
  isApproved: boolean;
  featured?: boolean;
  sortOrder?: number;
  authToken?: string | null;
}): Promise<{ reviewId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before moderating reviews.");
  }

  // This updates approval and feature flags for a testimonial.
  return await requestJson<{ reviewId: string }>(`/api/reviews/${params.reviewId}`, {
    method: "PUT",
    body: JSON.stringify({
      isApproved: params.isApproved,
      featured: params.featured,
      sortOrder: params.sortOrder,
    }),
  }, authToken);
}

export async function uploadGalleryItem(params: {
  title: string;
  category: string;
  caption?: string;
  altText?: string;
  imageUrl?: string | null;
  featured?: boolean;
  sortOrder?: number;
  authToken?: string | null;
}): Promise<GalleryItem> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before uploading gallery content.");
  }

  // Gallery uploads are restricted because they change the public showcase.
  return await requestJson<GalleryItem>("/api/gallery/upload", {
    method: "POST",
    body: JSON.stringify({
      title: params.title,
      category: params.category,
      caption: params.caption ?? "",
      altText: params.altText ?? params.title,
      imageUrl: params.imageUrl ?? null,
      featured: params.featured ?? false,
      sortOrder: params.sortOrder ?? Date.now(),
    }),
  }, authToken);
}

export async function deleteAppointment(params: {
  appointmentId: string;
  authToken?: string | null;
}): Promise<{ appointmentId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before deleting appointments.");
  }

  // Hard delete removes the appointment completely from the database.
  return await requestJson<{ appointmentId: string }>(`/api/appointments/${params.appointmentId}`, {
    method: "DELETE",
  }, authToken);
}

export async function deleteReview(params: {
  reviewId: string;
  authToken?: string | null;
}): Promise<{ reviewId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before deleting reviews.");
  }

  // Hard delete removes the review completely from the database.
  return await requestJson<{ reviewId: string }>(`/api/reviews/${params.reviewId}`, {
    method: "DELETE",
  }, authToken);
}

export async function completeAppointment(params: {
  appointmentId: string;
  authToken?: string | null;
}): Promise<{ appointmentId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before completing appointments.");
  }

  // Move completed appointment to archive and remove from active appointments.
  return await requestJson<{ appointmentId: string }>("/api/appointments/complete", {
    method: "POST",
    body: JSON.stringify({
      appointmentId: params.appointmentId,
    }),
  }, authToken);
}

// ==================== GALLERY ====================

/**
 * Fetch all gallery items
 * Used by: GalleryPage, HomePage
 */
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    // The gallery page can render directly from the public endpoint.
    const response = await fetch(`${API_BASE}/api/gallery`);
    if (!response.ok) throw new Error("Failed to fetch gallery");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    throw error;
  }
}

// ==================== REVIEWS ====================

/**
 * Fetch all approved reviews/testimonials
 * Used by: HomePage, TestimonialsPage
 */
export async function getReviews(): Promise<Review[]> {
  try {
    // Only approved testimonials are returned here.
    const response = await fetch(`${API_BASE}/api/reviews`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

/**
 * Submit a new review
 */
export async function submitReview(reviewData: {
  name: string;
  email: string;
  rating: number;
  mainQuote: string;
  subQuote1?: string;
  subQuote2?: string;
  serviceName?: string;
  serviceId?: string;
}, authToken: string | null = getStoredAuthToken()): Promise<{ reviewId: string } | null> {
  try {
    if (!authToken) {
      throw new Error("Please sign in before sharing a chronicle.");
    }

    // The testimonial form sends the signed-in user's story for moderation.
    return await requestJson<{ reviewId: string }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }, authToken);
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

// ==================== PROMOTIONS ====================

/**
 * Fetch all active promotions
 * Used by: OffersPage, HomePage
 */
export async function getPromotions(): Promise<Promotion[]> {
  try {
    // The homepage and offers page both pull their promo cards from the same endpoint.
    // Keeping them on one request means featured offers stay identical everywhere.
    const response = await fetch(`${API_BASE}/api/promotions`);
    if (!response.ok) throw new Error("Failed to fetch promotions");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
}

export async function getAdminPromotions(authToken: string | null = getStoredAuthToken()): Promise<Promotion[]> {
  if (!authToken) {
    throw new Error("Please sign in before opening the offers dashboard.");
  }

  try {
    // Try the admin-only endpoint first (requires a valid token).
    return await requestJson<Promotion[]>("/api/admin/promotions", { method: "GET" }, authToken);
  } catch (adminErr) {
    // If the admin endpoint fails (CORS, 404, network), fall back to the public promotions list so the admin UI can still display items read-only.
    // This avoids a hard crash in the browser when the backend isn't deployed or CORS blocks the admin route.
    console.warn("Admin promotions endpoint failed, falling back to public promotions:", adminErr);
    try {
      const response = await fetch(`${API_BASE}/api/promotions`);
      if (!response.ok) throw new Error("Failed to fetch public promotions");
      const data = await response.json();
      return (data.data || []) as Promotion[];
    } catch (publicErr) {
      console.error("Failed to load public promotions as fallback:", publicErr);
      throw new Error("Unable to load promotions from the server.");
    }
  }
}

export async function createPromotion(params: {
  promotion: {
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
  };
  authToken?: string | null;
}): Promise<Promotion> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before creating promotions.");
  }

  return await requestJson<Promotion>("/api/admin/promotions", {
    method: "POST",
    body: JSON.stringify(params.promotion),
  }, authToken);
}

export async function updatePromotion(params: {
  promotionId: string;
  updates: Partial<{
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
  }>;
  authToken?: string | null;
}): Promise<{ promotionId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before updating promotions.");
  }

  return await requestJson<{ promotionId: string }>(`/api/admin/promotions/${params.promotionId}`, {
    method: "PUT",
    body: JSON.stringify(params.updates),
  }, authToken);
}

export async function deletePromotion(params: {
  promotionId: string;
  authToken?: string | null;
}): Promise<{ promotionId: string }> {
  const authToken = params.authToken ?? getStoredAuthToken();
  if (!authToken) {
    throw new Error("Please sign in before deleting promotions.");
  }

  return await requestJson<{ promotionId: string }>(`/api/admin/promotions/${params.promotionId}`, {
    method: "DELETE",
  }, authToken);
}

// ==================== STYLISTS ====================

/**
 * Fetch all active stylists/staff
 * Used by: StylistsPage, BookingPage (admin)
 */
export async function getStylists(): Promise<Stylist[]> {
  try {
    // Staff cards are public, so this request does not need a login token.
    // The same list powers the stylists page and the admin assignment dropdowns.
    const response = await fetch(`${API_BASE}/api/staff`);
    if (!response.ok) throw new Error("Failed to fetch stylists");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching stylists:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format price from cents to currency string (AED)
 */
export function formatPrice(priceCents: number): string {
  // Currency formatting stays simple because the app always displays AED.
  // Converting from cents here keeps the UI code from repeating the same math everywhere.
  const amount = (priceCents / 100).toLocaleString('en-AE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${amount} AED`;
}

/**
 * Convert duration in minutes to readable format (e.g., "75 MINS")
 */
export function formatDuration(minutes: number): string {
  // Durations are shown as short labels so the cards stay easy to scan.
  // The uppercase label matches the visual language used across the booking page.
  return `${minutes} MINS`;
}

/**
 * Format date string (YYYY-MM-DD to readable format)
 */
export function formatDate(dateString: string): string {
  // This converts the raw ISO date into the friendlier label used in the UI.
  // The page components call this when they want the date to read like a normal sentence.
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


